import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateNewTopicDto } from './dtos/createNewTopic.dto';

@ApiTags('Admin / Topics')
@ApiBearerAuth('access-token')
@Controller('/courses/:id/topics')
export class TopicsController {
  constructor(private readonly topicService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a topic to a course' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the parent course' })
  @ApiResponse({ status: 201, description: 'Topic added. Returns the updated course with all topics.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  addTopic(@Param('id') courseId: string, @Body() createNewTopic: CreateNewTopicDto) {
    return this.topicService.addTopic(courseId, createNewTopic);
  }
}
