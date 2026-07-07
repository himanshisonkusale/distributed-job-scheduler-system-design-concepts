require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jobRoutes = require('./api/jobs');
const { register } = require('./utils/metrics');

require('./worker/worker');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api/jobs', jobRoutes);

app.listen(PORT, () => {
  console.log(`Scheduler API running on port ${PORT}`);
});