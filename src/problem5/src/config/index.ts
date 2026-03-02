import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  dbPath: process.env.DB_PATH || './data/database.sqlite',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV || 'development',
  cache: {
    ttl: 300, // 5 minutes in seconds
    prefix: 'todo:',
  },
} as const;
