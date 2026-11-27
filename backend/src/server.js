const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const prisma = require('./config/prisma');

async function start() {
  try {
    await prisma.$connect();
    console.log(`[${nodeEnv}] Database connected`);

    const server = app.listen(port, () => {
      console.log(`[${nodeEnv}] ParcelTrack API listening on http://localhost:${port}`);
      console.log(`[${nodeEnv}] Health check: http://localhost:${port}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[${nodeEnv}] ${signal} received, shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log(`[${nodeEnv}] Closed cleanly`);
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
