import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CODE_BLOCK_ACTION,
  PROJECT_CATEGORY,
  PROJECT_DIFFICULTY,
} from 'src/common/constants/project.constant';

class ImportCodeBlockDto {
  @ApiProperty({ example: 'src/app/app.component.ts' })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({ example: 'typescript' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ enum: [...CODE_BLOCK_ACTION], example: 'create' })
  @IsIn(CODE_BLOCK_ACTION)
  action!: string;

  @ApiProperty({ example: 'import { Component } from \'@angular/core\';' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Root component that bootstraps the app.' })
  @IsString()
  @IsOptional()
  explanation?: string;
}

class ImportStepDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({ example: 'Scaffold the Angular Project' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Use the Angular CLI to create a new project.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '## Creating the Project\n\nThe Angular CLI generates a ready-to-run project.' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ type: [String], example: ['npm install -g @angular/cli', 'ng new my-app'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commands?: string[];

  @ApiPropertyOptional({ type: [ImportCodeBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportCodeBlockDto)
  @IsOptional()
  codeBlocks?: ImportCodeBlockDto[];

  @ApiPropertyOptional({ example: 'Running `ng serve` opens the browser at http://localhost:4200.' })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({ type: [String], example: ['If `ng` is not found, reopen your terminal.'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  troubleshooting?: string[];
}

class ImportProjectMetaDto {
  @ApiProperty({ example: 'todo-app-angular' })
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

  @ApiProperty({ enum: [...PROJECT_CATEGORY], example: 'angular' })
  @IsIn(PROJECT_CATEGORY)
  category!: string;

  @ApiProperty({ enum: [...PROJECT_DIFFICULTY], example: 'beginner' })
  @IsIn(PROJECT_DIFFICULTY)
  difficulty!: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ type: [String], example: ['Angular 17+', 'Tailwind CSS 3'] })
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

export class ImportProjectDto {
  @ApiProperty({ type: ImportProjectMetaDto, description: 'Project metadata' })
  @ValidateNested()
  @Type(() => ImportProjectMetaDto)
  project!: ImportProjectMetaDto;

  @ApiProperty({ type: [ImportStepDto], description: 'Ordered array of project steps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportStepDto)
  steps!: ImportStepDto[];
}
