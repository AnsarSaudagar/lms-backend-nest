import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { promises as fs } from 'fs';
import * as path from 'path';
import { OpenRouterService } from 'src/infrastructure/ai/open-router.service';
import { ImportProjectDto } from '../projects/dtos/import-project.dto';
import { GenerateProjectDto } from './dtos/generate-project.dto';
import { PROJECT_CATEGORY, PROJECT_DIFFICULTY, CODE_BLOCK_ACTION } from 'src/common/constants/project.constant';

const SYSTEM_PROMPT = `You are a technical curriculum author generating a single coding tutorial project as JSON for a learning platform.

Output ONLY raw JSON — no markdown code fences, no commentary before or after. The JSON must exactly match this shape:

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
      "explanation": "markdown content explaining the concept for this step, at least a few paragraphs",
      "commands": ["shell commands the learner should run, or [] if none"],
      "codeBlocks": [
        {
          "filename": "relative/path.ext",
          "language": "e.g. jsx, ts, css, html",
          "action": one of ${JSON.stringify(CODE_BLOCK_ACTION)},
          "code": "the full file content or diff for this step",
          "explanation": "why this code is written this way"
        }
      ],
      "expectedOutput": "what the learner should see/observe after this step",
      "troubleshooting": ["common mistake -> how to fix it", "..."]
    }
  ]
}

Rules:
- Each step should take 5-15 minutes to complete.
- Code must be production quality — no TODO placeholders, no lorem ipsum.
- Produce between 8 and 15 steps, ordered and numbered starting at 1.
- "slug" must be lowercase kebab-case, derived from the title.
- Every field shown above is required unless the platform schema marks it optional; when in doubt, include it.`;

@Injectable()
export class ContentGeneratorService {
  constructor(private readonly openRouterService: OpenRouterService) {}

  async generateProject(dto: GenerateProjectDto) {
    const userPrompt = this.buildUserPrompt(dto);
    const raw = await this.openRouterService.chat(SYSTEM_PROMPT, userPrompt);
    const parsed = this.parseJson(raw);
    const validated = await this.validateProject(parsed);
    await this.saveToDisk(validated.project.slug, validated);
    return validated;
  }

  private buildUserPrompt(dto: GenerateProjectDto): string {
    const constraints: string[] = [`Topic: ${dto.topic}`];
    if (dto.category) constraints.push(`Category: ${dto.category}`);
    if (dto.difficulty) constraints.push(`Difficulty: ${dto.difficulty}`);
    if (dto.estimatedHours) constraints.push(`Target estimatedHours: ${dto.estimatedHours}`);
    return `Generate a full project tutorial for the following:\n${constraints.join('\n')}`;
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
      throw new InternalServerErrorException(
        'AI returned malformed JSON. Try again or refine the topic.',
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
