export const COURSE_STATUS = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    INACTIVE: 'In-active',
    REJECTED: 'Rejected'
} as const;
export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];