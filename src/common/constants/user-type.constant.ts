export const LEARNER_KEY = 'LEARNER';
export const ADMIN_KEY = 'ADMIN';
export const USER_TYPE = {
    [ADMIN_KEY]: 'Admin',
    [LEARNER_KEY]: 'Learner'
} as const;
export type DifficultyLevel =
  keyof typeof USER_TYPE;