require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/enrollmentRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve the built React app in production (single-server deployment)
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use('/api', notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  if (process.env.USE_MEMORY_DB === 'true') await require('./seed').run();
  const port = process.env.PORT || 5000;
  return app.listen(port, () => console.log(`LearnHub API running on http://localhost:${port}`));
};

if (require.main === module) start().catch((e) => { console.error(e); process.exit(1); });

module.exports = { app, start };
