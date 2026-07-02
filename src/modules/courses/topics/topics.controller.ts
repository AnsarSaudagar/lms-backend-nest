import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { CreateNewTopicDto } from './dtos/create-new-topic.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ADMIN_KEY } from 'src/common/constants/user-type.constant';

@ApiTags('Admin / Topics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_KEY)
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
