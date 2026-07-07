const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const DAGEngine = require('../engine/dag');
const { redisQueue } = require('../queue/redisQueue');
const { jobsSubmitted } = require('../utils/metrics');
const { analyzePriority } = require('../ai/priorityEngine');

// Submit new jobs
router.post('/submit', async (req, res) => {
  try {
    const { jobs } = req.body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'Jobs array required' });
    }

    const dag = new DAGEngine();
    const jobMap = {};

    for (const job of jobs) {
      const jobId = uuidv4();
      jobMap[job.name] = jobId;
      dag.addJob(jobId, []);
    }

    for (const job of jobs) {
      const jobId = jobMap[job.name];
      const deps = (job.dependsOn || []).map(depName => jobMap[depName]);
      dag.edges.set(jobId, deps);
    }

    if (dag.hasCycle()) {
      return res.status(400).json({ error: 'Circular dependency detected!' });
    }

    // DAG 
    const dagOrder = dag.getExecutionOrder();

    // AI se optimized order maango
    console.log('🤖 Asking AI for optimized job order...');
    const aiOrder = await analyzePriority(jobs);

    // Final execution order — 
    let executionOrder = dagOrder;
    if (aiOrder) {
      // AI order job id convert 
      const aiOrderIds = aiOrder
        .filter(name => jobMap[name])
        .map(name => jobMap[name]);

      
      if (aiOrderIds.length === dagOrder.length) {
        executionOrder = aiOrderIds;
        console.log('✅ Using AI optimized order');
      } else {
        console.log('⚠️ AI order incomplete — using DAG order');
      }
    }

    // Queue mein daalo
    for (const jobId of executionOrder) {
      const jobData = jobs.find(j => jobMap[j.name] === jobId);
      await redisQueue.push({
        id: jobId,
        name: jobData.name,
        command: jobData.command,
        priority: jobData.priority || 'medium',
        retries: 0,
        maxRetries: 3,
        createdAt: new Date().toISOString(),
      });
    }

    jobsSubmitted.inc(jobs.length);

    res.json({
      message: 'Jobs submitted successfully',
      totalJobs: jobs.length,
      aiOptimized: aiOrder !== null,
      executionOrder: executionOrder.map(id =>
        jobs.find(j => jobMap[j.name] === id)?.name
      ),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Queue status
router.get('/status', async (req, res) => {
  try {
    const queueSize = await redisQueue.size();
    const deadLetterSize = await redisQueue.deadLetterSize();

    res.json({
      queueSize,
      deadLetterSize,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;