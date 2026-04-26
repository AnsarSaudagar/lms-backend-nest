import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'src/app/app.component.ts' })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({ example: 'typescript' })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({ enum: ['create', 'modify', 'delete'], example: 'create' })
  @IsIn(['create', 'modify', 'delete'])
  action!: string;

  @ApiProperty({ example: 'export class AppComponent {}' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ example: 'Root component that bootstraps the application.' })
  @IsString()
  @IsOptional()
  explanation?: string;
}

export class CreateStepDto {
  @ApiProperty({ example: 1, description: 'Step number (must be unique within the project)', minimum: 1 })
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

  @ApiPropertyOptional({ type: [CodeBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeBlockDto)
  @IsOptional()
  codeBlocks?: CodeBlockDto[];

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
