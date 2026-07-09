import { Worker } from 'bullmq';
import {
  getRedisConnectionOptions,
  redisClient,
} from '../redis/redis.config';

const heartbeatInterval = setInterval(() => {
  redisClient.set(
    'imports:worker:heartbeat',
    Date.now().toString(),
    'EX',
    20,
  );
}, 5000);

redisClient.set('imports:worker:heartbeat', Date.now().toString(), 'EX', 20);

const worker = new Worker(
  'leads',
  async (job) => {
    const total = 100;

    let processed = 0;
    let created = 0;
    let duplicates = 0;
    let errors = 0;

    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      processed++;

      if (processed % 15 === 0) {
        duplicates++;
      } else if (processed % 22 === 0) {
        errors++;
      } else {
        created++;
      }

      if (processed % 20 === 0) {
        console.log(`job ${job.id} progress`, processed);
      }

      await job.updateProgress({
        percent: Math.round((processed / total) * 100),
        processed,
        created,
        duplicates,
        errors,
      });
    }

    return {
      processed,
      created,
      duplicates,
      errors,
    };
  },
  { connection: getRedisConnectionOptions() },
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job failed`, err);
});

const shutdown = async () => {
  clearInterval(heartbeatInterval);
  await redisClient.quit();
  process.exit(0);
};

process.on('SIGINT', () => {
  shutdown();
});
process.on('SIGTERM', () => {
  shutdown();
});
