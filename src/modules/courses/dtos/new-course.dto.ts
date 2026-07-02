import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewCourseDto {
  @ApiProperty({ example: 'Introduction to Angular', description: 'Course title (must be unique)' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Learn Angular from scratch with hands-on projects.' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
