import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TopicsService } from './topics.service';
import type { CreateNewTopicDto } from './dtos/createNewTopic.dto';

@Controller('/courses/:id/topics')
export class TopicsController {
    
    constructor(private readonly topicService: TopicsService){} 

    @Post()
    addTopic(@Param('id') courseId: string, @Body() createNewTopic: CreateNewTopicDto){
        return this.topicService.addTopic(courseId, createNewTopic);
    }
}
