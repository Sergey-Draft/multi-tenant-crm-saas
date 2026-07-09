import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CreateImportDto } from './dto/create-import.dto';
import {
  getRedisConnectionOptions,
  redisClient,
} from '../../redis/redis.config';

export const queue = new Queue('leads', {
  connection: getRedisConnectionOptions(),
});

@Injectable()
export class ImportsService {
  async createJob(body: CreateImportDto) {
    const job = await queue.add(
      'import-leads-demo',
      {
        leadIds: body.leadIds,
        name: body.name,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return {
      id: job.id,
      name: job.name,
      data: job.data,
    };
  }

  async getJob(id: string) {
    const job = await queue.getJob(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const state = await job.getState();
    const progress = (job.progress as {
      percent?: number;
      processed?: number;
      created?: number;
      duplicates?: number;
      errors?: number;
    }) ?? {};

    return {
      id: job.id,
      name: job.name,
      state,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason || null,
      returnvalue: job.returnvalue ?? null,
      progress: {
        percent: progress.percent ?? (state === 'completed' ? 100 : 0),
        processed: progress.processed ?? 0,
        created: progress.created ?? 0,
        duplicates: progress.duplicates ?? 0,
        errors: progress.errors ?? 0,
      },
    };
  }

  async getSystemStatus() {
    const startedAt = Date.now();
    let redisOnline = false;

    try {
      const pong = await redisClient.ping();
      redisOnline = pong === 'PONG';
    } catch {
      redisOnline = false;
    }

    const latencyMs = Date.now() - startedAt;
    const heartbeatRaw = await redisClient.get('imports:worker:heartbeat');
    const heartbeatTs = heartbeatRaw ? Number(heartbeatRaw) : null;
    const workerOnline =
      heartbeatTs !== null && Date.now() - heartbeatTs < 15000;

    return {
      redis: {
        online: redisOnline,
        latencyMs: redisOnline ? latencyMs : null,
      },
      worker: {
        online: workerOnline,
        lastHeartbeatAt: heartbeatTs,
      },
    };
  }

  async getQueueMetrics() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async getRecentJobs() {
    const jobs = await queue.getJobs(
      ['active', 'waiting', 'completed', 'failed', 'delayed'],
      0,
      -1,
      false,
    );

    return Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        state: await job.getState(),
        attemptsMade: job.attemptsMade,
        createdAt: job.timestamp,
        processedOn: job.processedOn ?? null,
        finishedOn: job.finishedOn ?? null,
        progress:
          typeof job.progress === 'object' && job.progress !== null
            ? (job.progress as Record<string, unknown>)
            : { percent: Number(job.progress ?? 0) },
        failedReason: job.failedReason || null,
      })),
    );
  }
}
