export const ACCESS_TYPE = {
  FREE: 'free',
  PAID: 'paid',
} as const;

export type AccessType = (typeof ACCESS_TYPE)[keyof typeof ACCESS_TYPE];
