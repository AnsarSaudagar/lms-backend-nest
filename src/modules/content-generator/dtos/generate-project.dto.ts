import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PROJECT_CATEGORY, PROJECT_DIFFICULTY } from 'src/common/constants/project.constant';

export class GenerateProjectDto {
  @ApiProperty({ example: 'Build a weather dashboard with the OpenWeather API' })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiPropertyOptional({ enum: [...PROJECT_CATEGORY], example: 'react' })
  @IsIn(PROJECT_CATEGORY)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: [...PROJECT_DIFFICULTY], example: 'beginner' })
  @IsIn(PROJECT_DIFFICULTY)
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ example: false, description: 'Defaults to false (free) if omitted' })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({ example: 499, description: 'Defaults to 0 if omitted. Ignored if isPaid is false.' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;
}
