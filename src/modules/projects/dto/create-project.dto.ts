import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'todo-app-angular', description: 'URL-safe unique identifier' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Build a Todo App with Angular & Tailwind CSS' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Build a fully functional Todo application using Angular.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['react', 'angular', 'html-css-js', 'ml', 'nodejs'], example: 'angular' })
  @IsIn(['react', 'angular', 'html-css-js', 'ml', 'nodejs'])
  category!: string;

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' })
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty!: string;

  @ApiPropertyOptional({ example: 4, description: 'Estimated completion time in hours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ type: [String], example: ['Angular 17+', 'Tailwind CSS 3', 'TypeScript'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techStack?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Basic understanding of HTML and CSS'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Create and use Angular components'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningOutcomes?: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { 'src/app/app.component.ts': 'Root component' },
  })
  @IsObject()
  @IsOptional()
  fileStructure?: Record<string, string>;

  @ApiPropertyOptional({
    example: { npm: { tailwindcss: '^3.4.0' }, installCommands: ['npm install -D tailwindcss'] },
  })
  @IsObject()
  @IsOptional()
  dependencies?: Record<string, unknown>;
}
