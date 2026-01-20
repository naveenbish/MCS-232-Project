import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;

  // Database
  DATABASE_URL: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Razorpay
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;

  // CORS
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];

  // Cookie
  COOKIE_SECRET: string;

  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Logging
  LOG_LEVEL: string;
  LOG_DIR: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing environment variable: ${key}`);
};

export const config: EnvConfig = {
  // Server
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  API_VERSION: getEnvVar('API_VERSION', 'v1'),

  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),

  // Razorpay
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID', ''),
  RAZORPAY_KEY_SECRET: getEnvVar('RAZORPAY_KEY_SECRET', ''),
  RAZORPAY_WEBHOOK_SECRET: getEnvVar('RAZORPAY_WEBHOOK_SECRET', ''),

  // CORS
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  ALLOWED_ORIGINS: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim()),

  // Cookie
  COOKIE_SECRET: getEnvVar('COOKIE_SECRET'),

  // File Upload
  MAX_FILE_SIZE: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880'), 10),
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', './uploads'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_DIR: getEnvVar('LOG_DIR', './logs'),
};

export default config;
