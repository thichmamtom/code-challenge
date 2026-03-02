import express from 'express';
import { config } from './config';
import { migrate } from './db/migrate';
import { closeDatabase } from './db/database';
import { closeRedis } from './db/redis';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import todoRoutes from './routes/todo.routes';
import morgan from 'morgan';
import { logger } from './utils/logger';

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Http Request Logger
const morganFormat = config.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/todos', todoRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Start Server ---
function start(): void {
  // Run migrations
  migrate();

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running on http://localhost:${config.port}`);
    logger.info(`📦 Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      closeDatabase();
      await closeRedis();
      logger.info('👋 Server shut down.');
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error('❌ Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();

export default app;
