export const DEFAULT_KEY = 'Learner';
export const USER_TYPE = {
    ADMIN: 'Admin',
    LEARNER: 'Learner'
} as const;
export type DifficultyLevel =
  keyof typeof USER_TYPE;