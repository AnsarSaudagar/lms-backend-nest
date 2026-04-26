import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TOPIC_STATUS, TopicStatus } from 'src/common/constants/topic-status.constant';

export class CreateNewTopicDto {
  @ApiProperty({ example: 'Getting Started with Components' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/images/topic1.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 'A deep dive into Angular component architecture.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ example: 'Learn how Angular components work.' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ example: 45, description: 'Duration of the topic in minutes' })
  @IsNumber()
  @Min(1)
  duration!: number;

  @ApiPropertyOptional({ type: [String], description: 'Array of video URLs', example: [] })
  @IsArray()
  @IsOptional()
  videos?: [];

  @ApiProperty({ enum: Object.values(TOPIC_STATUS), example: TOPIC_STATUS.DRAFT })
  @IsIn(Object.values(TOPIC_STATUS))
  status!: TopicStatus;
}
