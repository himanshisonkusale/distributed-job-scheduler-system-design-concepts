# ⚙️ Distributed Job Scheduler
### AI-Powered Task Orchestration Engine

<div align="center">

![Node](https://img.shields.io/badge/node-18+-00ff88?style=for-the-badge&logo=node.js)
![Redis](https://img.shields.io/badge/redis-7.0+-red?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/docker-ready-blue?style=for-the-badge&logo=docker)
![AI](https://img.shields.io/badge/AI-Groq+LLaMA-purple?style=for-the-badge)

**A production-grade distributed job scheduler with AI-powered priority optimization**

</div>

---

## 🎯 Problem Statement

Modern backend systems need to run thousands of background jobs — database backups, report generation, email dispatch, cache clearing — in the right order, at the right time, without human intervention. The challenges are:

- Jobs have **dependencies** — Report can't be generated before backup completes
- Jobs need **priority handling** — Critical jobs should run before low-priority ones
- **Workers fail** — A crashed worker shouldn't lose the job forever
- **Scale matters** — One worker isn't enough; multiple parallel workers needed
- **Observability** — Engineers need to see what's running, failing, and retrying

---

## 🏗️ System Architecture

```
[ Job Submission API ]
         │
         ▼
[ DAG Engine ]          ← Topological sort for dependency resolution
         │
         ▼
[ AI Priority Engine ]  ← Groq + LLaMA optimizes execution order
         │
         ▼
[ Redis Task Queue ]    ← Distributed job queue
         │
    ┌────┼────┐
    ▼    ▼    ▼
[W1] [W2] [W3]         ← 3 parallel Docker workers
         │
         ▼
[ Prometheus + Grafana ] ← Live monitoring
[ React Dashboard ]      ← Real-time visualization
```

---

## 🔥 Key Features

### 1. DAG-Based Dependency Resolution
Jobs with dependencies are automatically ordered using **topological sort**. Circular dependencies are detected and rejected before execution.

```
DatabaseBackup → GenerateReport → SendEmail
ClearCache (independent — runs in parallel)
```

### 2. AI Priority Engine
**Groq AI (LLaMA 3.1)** analyzes job metadata — priority, dependencies, execution history — and returns an optimized execution order. Falls back to DAG order if AI is unavailable.

```
Input:  DatabaseBackup(high), GenerateReport(medium), ClearCache(high)
AI Output: DatabaseBackup → ClearCache → GenerateReport
```

### 3. Fault-Tolerant Execution
- **Retry with Exponential Backoff** — 1s → 3s → 9s between retries
- **Dead Letter Queue** — Jobs that exhaust retries are moved here, never lost
- **3 Parallel Workers** — Jobs are distributed across workers automatically

### 4. Live Observability
- **Prometheus** — Scrapes metrics every 5 seconds
- **Grafana** — Production-style live graphs
- **React Dashboard** — Custom real-time UI with job stats and AI order visualization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Queue | Redis |
| AI Engine | Groq API (LLaMA 3.1) |
| Workers | Docker containers |
| Monitoring | Prometheus + Grafana |
| Dashboard | React + Recharts |
| Infra | Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js v18+
- Groq API key (free at console.groq.com)

### Run the System

```bash
# 1. Clone
git clone https://github.com/himanshisonkusale/distributed-job-scheduler.git
cd distributed-job-scheduler

# 2. Setup env
echo "PORT=8080" > .env
echo "REDIS_HOST=localhost" >> .env
echo "GROQ_API_KEY=your_key_here" >> .env

# 3. Start infrastructure
docker-compose up -d

# 4. Start server
npm install
node src/server.js

# 5. Start dashboard
cd dashboard
npm install
npm start
```

### Services

| Service | URL |
|---------|-----|
| API | http://localhost:8080 |
| Dashboard | http://localhost:5000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:4000 |

---

## 🧪 Testing

### Submit Jobs with AI Priority
```bash
curl -X POST http://localhost:8080/api/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobs": [
      { "name": "DatabaseBackup", "command": "backup.sh", "priority": "high", "dependsOn": [] },
      { "name": "GenerateReport", "command": "report.sh", "priority": "medium", "dependsOn": ["DatabaseBackup"] },
      { "name": "SendEmail", "command": "email.sh", "priority": "low", "dependsOn": ["GenerateReport"] },
      { "name": "ClearCache", "command": "cache.sh", "priority": "high", "dependsOn": [] }
    ]
  }'
```

### Check Queue Status
```bash
curl http://localhost:8080/api/jobs/status
```

---

## 📊 Metrics Tracked

```
jobs_submitted_total    → Total jobs submitted
jobs_completed_total    → Successfully completed jobs
jobs_failed_total       → Jobs sent to dead letter queue
jobs_retried_total      → Total retry attempts
job_duration_ms         → Execution time histogram
queue_size              → Current queue depth
```

---

## 🎓 Engineering Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| Graph Algorithms | DAG + Topological Sort for dependency resolution |
| Distributed Queue | Redis-based task queue with FIFO ordering |
| Fault Tolerance | Retry + Exponential Backoff + Dead Letter Queue |
| AI Integration | Groq LLaMA for intelligent job prioritization |
| Containerization | Docker Compose orchestration |
| Observability | Prometheus metrics + Grafana + custom React dashboard |
| Concurrency | 3 parallel workers processing jobs simultaneously |

---

## 👩‍💻 Author

**Himanshi Sonkusale**
[github.com/himanshisonkusale](https://github.com/himanshisonkusale)

---

*AI-Powered • Fault Tolerant • Real-Time Monitoring • Production-Grade*