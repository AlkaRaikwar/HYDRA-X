const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const triageRoutes = require('./routes/triage');
const teleconsultRoutes = require('./routes/teleconsult');
const stockRoutes = require('./routes/stock');
const followupRoutes = require('./routes/followup');
const dashboardRoutes = require('./routes/dashboard');
const insightsRoutes = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.WATSONX_API_KEY ? 'IBM_GRANITE' : 'DEMO',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/triage', triageRoutes);
app.use('/api/teleconsult', teleconsultRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/followup', followupRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/insights', insightsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  const mode = process.env.WATSONX_API_KEY ? 'IBM Granite (watsonx)' : 'DEMO MODE';
  console.log(`\n⬡ HYDRA-X API running on http://localhost:${PORT}`);
  console.log(`🤖 AI Mode: ${mode}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
