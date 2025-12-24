export const TOPIC_STATUS = {
    DRAFT: 'DRAFT',
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE'
} as const;
export type TopicStatus = (typeof TOPIC_STATUS)[keyof typeof TOPIC_STATUS];