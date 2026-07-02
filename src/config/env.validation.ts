import * as Joi from 'joi';

/**
 * Validated at boot via ConfigModule.forRoot — a missing or malformed
 * variable fails startup instead of surfacing as a runtime error later.
 */
export const envValidationSchema = Joi.object({
  MONGO_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  PORT: Joi.number().default(3000),
  ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  GEMINI_API_KEY: Joi.string().required(),

  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),

  GMAIL_USER: Joi.string().email().required(),
  GMAIL_APP_PASSWORD: Joi.string().required(),
});
