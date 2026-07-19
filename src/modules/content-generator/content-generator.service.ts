import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { promises as fs } from 'fs';
import * as path from 'path';
import { OpenRouterService } from 'src/infrastructure/ai/open-router.service';
import { ProjectsService } from '../projects/projects.service';
import { ImportProjectDto } from '../projects/dtos/import-project.dto';
import { GenerateProjectDto } from './dtos/generate-project.dto';
import { PROJECT_CATEGORY, PROJECT_DIFFICULTY, CODE_BLOCK_ACTION } from 'src/common/constants/project.constant';

interface FileHint {
  filename: string;
  language: string;
  action: string;
}

interface StepSkeleton {
  stepNumber: number;
  title: string;
  description?: string;
  commands?: string[];
  expectedOutput?: string;
  troubleshooting?: string[];
  files: FileHint[];
}

interface ProjectSkeleton {
  project: Record<string, unknown>;
  steps: StepSkeleton[];
}

interface StepDetail {
  explanation: string;
  codeBlocks: Array<{ filename: string; language: string; action: string; code: string; explanation?: string }>;
}

/**
 * Free-tier OpenRouter models silently cap real output well below whatever
 * max_tokens is requested — asking for a whole 8-15 step tutorial with full
 * code in one completion gets truncated mid-JSON. So generation is split:
 * one small call for the project meta + step outlines, then one bounded call
 * per step to fill in its explanation/code. Each call stays well under any
 * realistic free-tier ceiling.
 */
const SKELETON_SYSTEM_PROMPT = `You are a technical curriculum author planning a coding tutorial project for a learning platform.

Output ONLY raw JSON — no markdown code fences, no commentary before or after. Do NOT include any code or long explanations yet, just the plan. Match this shape exactly:

{
  "project": {
    "slug": "kebab-case-slug",
    "title": "...",
    "description": "...",
    "category": one of ${JSON.stringify(PROJECT_CATEGORY)},
    "difficulty": one of ${JSON.stringify(PROJECT_DIFFICULTY)},
    "estimatedHours": number,
    "techStack": ["..."],
    "prerequisites": ["..."],
    "learningOutcomes": ["..."],
    "fileStructure": { "path/to/file": "short description of that file" },
    "dependencies": { "npm": { "package-name": "^1.0.0" }, "installCommands": ["npm install ..."] }
  },
  "steps": [
    {
      "stepNumber": 1,
      "title": "...",
      "description": "one sentence summary",
      "commands": ["shell commands the learner should run, or [] if none"],
      "expectedOutput": "what the learner should see/observe after this step",
      "troubleshooting": ["common mistake -> how to fix it", "..."],
      "files": [
        { "filename": "relative/path.ext", "language": "e.g. jsx, ts, css, html", "action": one of ${JSON.stringify(CODE_BLOCK_ACTION)} }
      ]
    }
  ]
}

Rules:
- Produce between 8 and 15 steps, ordered and numbered starting at 1.
- Each step should take 5-15 minutes to complete.
- "files" lists every file that step's code will touch — leave "files": [] for steps with no code (e.g. a final testing/review step).
- "slug" must be lowercase kebab-case, derived from the title.`;

const STEP_DETAIL_SYSTEM_PROMPT = `You are a technical curriculum author writing ONE step of a coding tutorial. You will be given the project context and this step's title, description, and the exact list of files it must produce.

Output ONLY raw JSON — no markdown code fences, no commentary before or after. Generate "codeBlocks" first, then "explanation". Match this shape exactly:

{
  "codeBlocks": [
    {
      "filename": "must match one of the given files exactly",
      "language": "must match the given language",
      "action": "must match the given action",
      "code": "the full, production-quality file content or diff for this step",
      "explanation": "one sentence on why this code is written this way"
    }
  ],
  "explanation": "markdown content explaining the concept for this step — 3 to 5 sentences MAXIMUM, do not write multiple paragraphs"
}

Rules:
- Code must be production quality — no TODO placeholders, no lorem ipsum.
- Produce exactly one codeBlock per file listed, in the same order, with the same filename/language/action.
- If no files are listed, return "codeBlocks": [].
- Keep "explanation" short — 3 to 5 sentences maximum. The code and its per-file "explanation" carry the detail, not this field.`;

@Injectable()
export class ContentGeneratorService {
  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly projectsService: ProjectsService,
  ) {}

  async generateProject(dto: GenerateProjectDto) {
    const skeleton = await this.generateSkeleton(dto);
    const steps = await this.fillAllStepDetails(skeleton);

    // isPaid/price are never requested from the AI — the caller controls
    // them directly, so they're forced onto the plan here before validation.
    const assembled = {
      project: { ...skeleton.project, isPaid: dto.isPaid ?? false, price: dto.price ?? 0 },
      steps,
    };
    const validated = await this.validateProject(assembled);

    await this.saveToDisk(validated.project.slug, validated);
    const project = await this.projectsService.import(validated);
    return { project, generated: validated };
  }

  private async generateSkeleton(dto: GenerateProjectDto): Promise<ProjectSkeleton> {
    const constraints: string[] = [`Topic: ${dto.topic}`];
    if (dto.category) constraints.push(`Category: ${dto.category}`);
    if (dto.difficulty) constraints.push(`Difficulty: ${dto.difficulty}`);
    if (dto.estimatedHours) constraints.push(`Target estimatedHours: ${dto.estimatedHours}`);
    const userPrompt = `Plan a full project tutorial for the following:\n${constraints.join('\n')}`;

    const raw = await this.openRouterService.chat(SKELETON_SYSTEM_PROMPT, userPrompt, {
      maxTokens: 3000,
      label: `skeleton plan for "${dto.topic}"`,
    });
    const parsed = this.parseJson(raw) as Partial<ProjectSkeleton>;

    if (!parsed.project || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new InternalServerErrorException(
        'AI plan was missing "project" or "steps". Try again or refine the topic.',
      );
    }

    return parsed as ProjectSkeleton;
  }

  private async fillAllStepDetails(skeleton: ProjectSkeleton) {
    const filledSteps: Array<{
      stepNumber: number;
      title: string;
      description?: string;
      commands?: string[];
      expectedOutput?: string;
      troubleshooting?: string[];
      explanation: string;
      codeBlocks: StepDetail['codeBlocks'];
    }> = [];

    // Sequential, not parallel — spaces out requests against the same
    // free-tier rate limit instead of firing them all at once.
    for (const step of skeleton.steps) {
      const detail = await this.fillStepDetail(skeleton.project, step);
      filledSteps.push({
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        commands: step.commands,
        expectedOutput: step.expectedOutput,
        troubleshooting: step.troubleshooting,
        explanation: detail.explanation,
        codeBlocks: detail.codeBlocks,
      });
    }

    return filledSteps;
  }

  private async fillStepDetail(project: Record<string, unknown>, step: StepSkeleton): Promise<StepDetail> {
    const userPrompt = `Project: ${project.title} (${project.category}, ${project.difficulty})
Tech stack: ${JSON.stringify(project.techStack ?? [])}

Step ${step.stepNumber}: ${step.title}
Description: ${step.description ?? ''}
Files to produce: ${JSON.stringify(step.files)}`;

    const raw = await this.openRouterService.chat(STEP_DETAIL_SYSTEM_PROMPT, userPrompt, {
      maxTokens: 6000,
      label: `step ${step.stepNumber} ("${step.title}")`,
    });
    const parsed = this.parseJson(raw) as Partial<StepDetail>;

    if (!parsed.explanation || !Array.isArray(parsed.codeBlocks)) {
      throw new InternalServerErrorException(
        `AI response for step ${step.stepNumber} ("${step.title}") was missing "explanation" or "codeBlocks".`,
      );
    }

    return parsed as StepDetail;
  }

  private parseJson(raw: string): unknown {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      const tail = cleaned.slice(-300);
      throw new InternalServerErrorException(
        `AI returned malformed JSON. Try again or refine the topic. Last 300 chars of output: ${tail}`,
      );
    }
  }

  private async validateProject(parsed: unknown): Promise<ImportProjectDto> {
    const instance = plainToInstance(ImportProjectDto, parsed);
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: false });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Generated project failed schema validation',
        errors: errors.map((e) => ({ property: e.property, constraints: e.constraints })),
      });
    }

    return instance;
  }

  private async saveToDisk(slug: string, project: ImportProjectDto): Promise<void> {
    const dir = path.join(process.cwd(), 'generated');
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }
}
