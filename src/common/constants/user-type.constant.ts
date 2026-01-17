export const LEARNER_KEY = 'Learner';
export const ADMIN_KEY = 'Admin';
export const USER_TYPE = {
    [ADMIN_KEY]: 'Admin',
    [LEARNER_KEY]: 'Learner'
} as const;
export type DifficultyLevel =
  keyof typeof USER_TYPE;