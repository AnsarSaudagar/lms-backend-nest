import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  CODE_BLOCK_ACTION,
  PROJECT_CATEGORY,
  PROJECT_DIFFICULTY,
} from 'src/common/constants/project.constant';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ _id: false })
export class CodeBlock {
  @Prop({ required: true, trim: true })
  filename!: string;

  @Prop({ required: true, trim: true })
  language!: string;

  @Prop({ required: true, enum: [...CODE_BLOCK_ACTION] })
  action!: string;

  @Prop({ required: true })
  code!: string;

  @Prop({ trim: true })
  explanation?: string;
}

export const CodeBlockSchema = SchemaFactory.createForClass(CodeBlock);

@Schema({ _id: false })
export class ProjectStep {
  @Prop({ required: true, min: 1 })
  stepNumber!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  explanation?: string;

  @Prop({ type: [String], default: [] })
  commands!: string[];

  @Prop({ type: [CodeBlockSchema], default: [] })
  codeBlocks!: CodeBlock[];

  @Prop({ trim: true })
  expectedOutput?: string;

  @Prop({ type: [String], default: [] })
  troubleshooting!: string[];
}

export const ProjectStepSchema = SchemaFactory.createForClass(ProjectStep);

@Schema({ timestamps: true, versionKey: false })
export class Project {
  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    required: true,
    enum: [...PROJECT_CATEGORY],
    index: true,
  })
  category!: string;

  @Prop({
    required: true,
    enum: [...PROJECT_DIFFICULTY],
    index: true,
  })
  difficulty!: string;

  @Prop({ type: Number, min: 0, default: 0 })
  estimatedHours!: number;

  @Prop({ type: [String], default: [] })
  techStack!: string[];

  @Prop({ type: [String], default: [] })
  prerequisites!: string[];

  @Prop({ type: [String], default: [] })
  learningOutcomes!: string[];

  @Prop({ type: Object, default: {} })
  fileStructure!: Record<string, string>;

  @Prop({ type: Object, default: {} })
  dependencies!: Record<string, unknown>;

  @Prop({ type: Boolean, default: false, index: true })
  isPaid!: boolean;

  @Prop({ type: Number, min: 0, default: 0 })
  price!: number;

  @Prop({ type: [ProjectStepSchema], default: [] })
  steps!: ProjectStep[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ title: 'text', description: 'text' });

ProjectSchema.virtual('stepCount').get(function () {
  return this.steps.length;
});
