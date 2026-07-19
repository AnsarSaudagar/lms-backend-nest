export const CONTENT_GENERATION_QUEUE = 'content-generation';

export const GENERATION_JOB_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type GenerationJobStatus = (typeof GENERATION_JOB_STATUS)[keyof typeof GENERATION_JOB_STATUS];
