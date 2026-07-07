const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
  retryStrategy: () => null,
  lazyConnect: true,
  connectTimeout: 500,
});

redis.on('connect', () => console.log('Redis connected!'));
redis.on('error', (err) => console.error('Redis error:', err.message));

const QUEUE_KEY = 'scheduler:jobs';
const PROCESSING_KEY = 'scheduler:processing';
const DEAD_LETTER_KEY = 'scheduler:failed';

const redisQueue = {
  // Job queue mein daalo
  async push(job) {
    await redis.lpush(QUEUE_KEY, JSON.stringify(job));
    console.log(`Job ${job.id} added to queue`);
  },

  // Queue se job nikalo
  async pop() {
    const job = await redis.brpop(QUEUE_KEY, 5);
    if (!job) return null;
    return JSON.parse(job[1]);
  },

  // Processing mein mark karo
  async markProcessing(jobId) {
    await redis.hset(PROCESSING_KEY, jobId, Date.now());
  },

  // Processing se hatao
  async markDone(jobId) {
    await redis.hdel(PROCESSING_KEY, jobId);
  },

  // Dead letter queue mein daalo (baar baar fail hone pe)
  async sendToDeadLetter(job) {
    await redis.lpush(DEAD_LETTER_KEY, JSON.stringify({
      ...job,
      failedAt: new Date().toISOString(),
    }));
    console.log(`Job ${job.id} sent to dead letter queue`);
  },

  // Queue size
  async size() {
    return await redis.llen(QUEUE_KEY);
  },

  // Dead letter queue size
  async deadLetterSize() {
    return await redis.llen(DEAD_LETTER_KEY);
  }
};

module.exports = { redisQueue, redis };