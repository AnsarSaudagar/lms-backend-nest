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

class ImportCodeBlockDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsIn(['create', 'modify', 'delete'])
  action!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsOptional()
  explanation?: string;
}

class ImportStepDto {
  @IsNumber()
  @Min(1)
  stepNumber!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commands?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportCodeBlockDto)
  @IsOptional()
  codeBlocks?: ImportCodeBlockDto[];

  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  troubleshooting?: string[];
}

class ImportProjectMetaDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['react', 'angular', 'html-css-js', 'ml', 'nodejs'])
  category!: string;

  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  techStack?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningOutcomes?: string[];

  @IsObject()
  @IsOptional()
  fileStructure?: Record<string, string>;

  @IsObject()
  @IsOptional()
  dependencies?: Record<string, unknown>;
}

export class ImportProjectDto {
  @ValidateNested()
  @Type(() => ImportProjectMetaDto)
  project!: ImportProjectMetaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportStepDto)
  steps!: ImportStepDto[];
}
