export const DIFFICULTY_LEVEL = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced'
} as const;

export type DiffucultyLevel = (typeof DIFFICULTY_LEVEL)[keyof typeof DIFFICULTY_LEVEL];