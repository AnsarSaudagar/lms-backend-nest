export const COURSE_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    INACTIVE: 'INACTIVE',
    REJECTED: 'REJECTED'
} as const;
export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];