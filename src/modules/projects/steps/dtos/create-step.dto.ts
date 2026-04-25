import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CodeBlockDto {
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

export class CreateStepDto {
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
  @Type(() => CodeBlockDto)
  @IsOptional()
  codeBlocks?: CodeBlockDto[];

  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  troubleshooting?: string[];
}
