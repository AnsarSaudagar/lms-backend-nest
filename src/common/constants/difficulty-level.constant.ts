export const DIFFICULTY_LEVEL = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export type DifficultyLevel =
  keyof typeof DIFFICULTY_LEVEL;
