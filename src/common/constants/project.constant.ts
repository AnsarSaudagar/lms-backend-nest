export const PROJECT_CATEGORY = [
  'react',
  'angular',
  'html-css-js',
  'ml',
  'nodejs',
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORY)[number];

export const PROJECT_DIFFICULTY = [
  'beginner',
  'intermediate',
  'advanced',
] as const;
export type ProjectDifficulty = (typeof PROJECT_DIFFICULTY)[number];

export const CODE_BLOCK_ACTION = ['create', 'modify', 'delete'] as const;
export type CodeBlockAction = (typeof CODE_BLOCK_ACTION)[number];
