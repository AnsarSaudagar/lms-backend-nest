import { TopicStatus } from "src/common/constants/topic-status.constant";

export interface CreateNewTopicDto{
    title : string;
    image ?: string;
    description: string;
    shortDescription ?: string;
    duration: number;
    videos : [];
    status : TopicStatus;
}