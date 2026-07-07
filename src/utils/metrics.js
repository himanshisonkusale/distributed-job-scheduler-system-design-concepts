const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const jobsSubmitted = new client.Counter({
  name: 'jobs_submitted_total',
  help: 'Total jobs submitted',
  registers: [register],
});

const jobsCompleted = new client.Counter({
  name: 'jobs_completed_total',
  help: 'Total jobs completed successfully',
  registers: [register],
});

const jobsFailed = new client.Counter({
  name: 'jobs_failed_total',
  help: 'Total jobs failed and sent to dead letter queue',
  registers: [register],
});

const jobsRetried = new client.Counter({
  name: 'jobs_retried_total',
  help: 'Total job retries',
  registers: [register],
});

const queueSize = new client.Gauge({
  name: 'queue_size',
  help: 'Current jobs in queue',
  registers: [register],
});

const jobDuration = new client.Histogram({
  name: 'job_duration_ms',
  help: 'Job execution duration in milliseconds',
  buckets: [100, 500, 1000, 2000, 5000],
  registers: [register],
});

module.exports = {
  register,
  jobsSubmitted,
  jobsCompleted,
  jobsFailed,
  jobsRetried,
  queueSize,
  jobDuration,
};