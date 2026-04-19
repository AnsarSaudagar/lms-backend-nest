// course-generator.service.ts
import { Injectable } from '@nestjs/common';
import { Ollama } from 'ollama';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseGeneratorService {
  private ollama = new Ollama({ host: 'http://localhost:11434' });
  private MODEL = 'qwen2.5:7b';

  constructor(@InjectModel('Course') private courseModel: Model<any>) {}

  async generateCourse(topic: string) {
    // Phase 1: Generate structure
    
    const structure = await this.generateStructure(topic);

    const course = await this.courseModel.create(structure);

    return course;


    // Phase 2: Enrich each subtopic with content
    // for (const t of structure.topics) {
    //   for (const sub of t.subtopics) {
    //     const content = await this.generateSubtopicContent(
    //       topic,
    //       t.title,
    //       sub.title,
    //     );
    //     sub.description = content.description;
    //     sub.content = content.content;
    //     sub.codeExample = content.codeExample || null;
    //   }
    // }
    // return structure;
    // Save to MongoDB
    // const course = await this.courseModel.create(structure);
    // return course;
  }

  // ── Phase 1 ──────────────────────────────────────────
  private async generateStructure(topic: string) {
    const prompt = `
You are a course creator. Generate a complete course outline for given "${topic}", create multiple topics.
Return ONLY valid JSON, no extra text, no markdown, no explanation.

{
  "title": "course title",
  "description": "brief course description",
  "topics": [
    {
      "title": "topic title",
      "order": 1,
      description: "topic descroption should be atleast 100 words"
      shortDescription: "short descriptions"
    }
  ]
}
`;
    const response = await this.ollama.chat({
      model: this.MODEL,
      messages: [{ role: 'user', content: prompt }],
      format: 'json', // 👈 forces JSON output
    });

    return JSON.parse(response.message.content);
  }

  // ── Phase 2 ──────────────────────────────────────────
  private async generateSubtopicContent(
    course: string,
    topic: string,
    subtopic: string,
  ) {
    const prompt = `
You are a technical educator. Write detailed learning content for:
Course: "${course}"
Topic: "${topic}"
Subtopic: "${subtopic}"

Return ONLY valid JSON:
{
  "description": "one line summary",
  "content": "detailed explanation in markdown",
  "codeExample": "code snippet if applicable, else null"
}
`;
    const response = await this.ollama.chat({
      model: this.MODEL,
      messages: [{ role: 'user', content: prompt }],
      format: 'json',
    });

    return JSON.parse(response.message.content);
  }
}
