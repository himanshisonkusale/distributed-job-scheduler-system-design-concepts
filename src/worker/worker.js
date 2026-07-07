const { redisQueue } = require('../queue/redisQueue');
const { jobsCompleted, jobsFailed, jobsRetried, jobDuration } = require('../utils/metrics');

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 9000];

const executeJob = async (job) => {
  console.log(`🔄 Executing job: ${job.name} (${job.id})`);

  return new Promise((resolve, reject) => {
    const executionTime = Math.random() * 2000 + 500;

    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error(`Job ${job.name} failed!`));
      } else {
        resolve({ success: true, executionTime });
      }
    }, executionTime);
  });
};

const executeWithRetry = async (job) => {
  const end = jobDuration.startTimer();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await redisQueue.markProcessing(job.id);
      const result = await executeJob(job);

      await redisQueue.markDone(job.id);
      jobsCompleted.inc();
      end();
      console.log(`✅ Job ${job.name} completed successfully`);
      return result;

    } catch (err) {
      console.error(`❌ Job ${job.name} failed (attempt ${attempt + 1}): ${err.message}`);

      if (attempt < MAX_RETRIES) {
        jobsRetried.inc();
        const delay = RETRY_DELAYS[attempt];
        console.log(`⏳ Retrying job ${job.name} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        await redisQueue.markDone(job.id);
        await redisQueue.sendToDeadLetter({
          ...job,
          error: err.message,
          attempts: attempt + 1,
        });
        jobsFailed.inc();
        end();
        console.log(`💀 Job ${job.name} sent to dead letter queue`);
      }
    }
  }
};

const startWorker = async (workerId) => {
  console.log(`🚀 Worker ${workerId} started — waiting for jobs...`);

  while (true) {
    try {
      const job = await redisQueue.pop();
      if (!job) continue;

      console.log(`📦 Worker ${workerId} picked up job: ${job.name}`);
      await executeWithRetry(job);

    } catch (err) {
      console.error(`Worker ${workerId} error:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

const NUM_WORKERS = 3;

const startAllWorkers = () => {
  console.log(`Starting ${NUM_WORKERS} workers...`);
  for (let i = 1; i <= NUM_WORKERS; i++) {
    startWorker(`W${i}`);
  }
};

startAllWorkers();