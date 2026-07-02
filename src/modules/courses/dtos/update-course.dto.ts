import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  COURSE_STATUS,
  type CourseStatus,
} from 'src/common/constants/course-status.constant';
import { DIFFICULTY_LEVEL } from 'src/common/constants/difficulty-level.constant';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Introduction to Angular' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Learn Angular from scratch.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: Object.values(COURSE_STATUS) })
  @IsOptional()
  @IsIn(Object.values(COURSE_STATUS))
  status?: CourseStatus;

  @ApiPropertyOptional({ example: 499, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: Object.keys(DIFFICULTY_LEVEL) })
  @IsOptional()
  @IsIn(Object.keys(DIFFICULTY_LEVEL))
  difficultyLevel?: string;

  @ApiPropertyOptional({ description: 'Category ObjectId' })
  @IsOptional()
  @IsMongoId()
  category?: string;

  @ApiPropertyOptional({ description: 'Cloudinary image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
