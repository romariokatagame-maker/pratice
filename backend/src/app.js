const express = require('express');
const cors = require('cors');
const store = require('./data/store');
const authRoutes = require('./routes/auth');
const reportsRouter = require('./routes/reports');

function createApp(io) {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'timika-aman-backend' });
  });

  app.get('/api/crime-types', (req, res) => {
    res.json(store.CRIME_TYPES);
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportsRouter(io));

  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  });

  return app;
}

module.exports = createApp;
