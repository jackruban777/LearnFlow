import http from 'http';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';

async function bootstrap() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.warn('⚠️ Database connection failed. Running in mock/offline mode:', (err as Error).message);
  }

  const app = createApp();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`\n🚀 LearnFlow API running on port ${PORT}`);
    console.log(`   Environment : ${NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API base    : http://localhost:${PORT}/api\n`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('🔌 HTTP server closed');

      try {
        await prisma.$disconnect();
        console.log('🔌 Database disconnected');
      } catch (err) {
        console.error('Error disconnecting from database:', err);
      }

      try {
        redis.disconnect();
        console.log('🔌 Redis disconnected');
      } catch (err) {
        console.error('Error disconnecting from Redis:', err);
      }

      console.log('👋 Graceful shutdown complete');
      process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30_000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    void shutdown('uncaughtException');
  });
}

void bootstrap();
