import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class StepNumberDto {
  @ApiProperty({ example: 3, description: 'The step number (1-based)', minimum: 1 })
  @IsInt()
  @Min(1)
  stepNumber!: number;
}
