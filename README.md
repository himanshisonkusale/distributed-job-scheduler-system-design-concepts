# ⚙️ Distributed Job Scheduler
### AI-Powered Task Orchestration Engine

![Node](https://img.shields.io/badge/node-18+-00ff88?style=for-the-badge&logo=node.js)
![Redis](https://img.shields.io/badge/redis-7.0+-red?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/docker-ready-blue?style=for-the-badge&logo=docker)
![AI](https://img.shields.io/badge/AI-Groq+LLaMA-purple?style=for-the-badge)
![CI](https://img.shields.io/badge/CI-passing-brightgreen?style=for-the-badge)

---

## What I Built

A production-grade distributed job scheduler that automatically decides when, where, and in what order background jobs run — without human intervention. Think of it like a smarter version of Cron or Airflow — jobs have dependencies, priorities, and workers that can fail — and the system handles all of it gracefully.

Real-world use case: a backend system that needs to run DatabaseBackup → GenerateReport → SendEmail in order, while ClearCache (independent, high-priority) runs in parallel — all automatically, with retries if anything fails.

---

## Key Features

- **DAG-Based Dependency Resolution** — Topological sort resolves job execution order based on declared dependencies. Circular dependencies are detected and rejected before execution.
- **AI Priority Engine** — Groq AI (LLaMA 3.1) analyzes job metadata (priority, dependencies) and returns an optimized execution order. Falls back to DAG order if AI is unavailable.
- **3 Parallel Workers** — Jobs are distributed across 3 Docker worker containers running concurrently, each independently polling the Redis queue.
- **Fault Tolerance** — Failed jobs retry with exponential backoff (1s → 3s → 9s). Jobs that exhaust all retries move to a Dead Letter Queue — never silently lost.
- **Live Monitoring** — Prometheus scrapes metrics every 5s. Grafana displays live graphs. Custom React dashboard shows real-time job stats, AI-optimized order, and queue depth.
- **CI/CD** — GitHub Actions pipeline runs on every push: installs dependencies, starts the server, validates `/health` and `/metrics` endpoints, and builds the dashboard.

---

## Tech Stack

```
Node.js, Express.js, Redis, Docker, Groq AI, React, Prometheus, Grafana, GitHub Actions
```

---

## Quick Start

```bash
git clone https://github.com/himanshisonkusale/distributed-job-scheduler-system-design-concepts.git
cd distributed-job-scheduler-system-design-concepts

# Add your Groq API key
echo "GROQ_API_KEY=your_key" > .env
echo "REDIS_HOST=localhost" >> .env

# Start infrastructure
docker-compose up -d

# Start server
npm install && node src/server.js

# Start dashboard (new terminal)
cd dashboard && npm install && npm start
```

| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| Dashboard | http://localhost:5000 |
| Grafana | http://localhost:4000 |

---

## 👩‍💻 Author

**Himanshi Sonkusale** — [github.com/himanshisonkusale](https://github.com/himanshisonkusale)