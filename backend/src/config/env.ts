import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || '',
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || '',
};
