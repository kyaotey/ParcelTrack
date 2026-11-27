const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clientUrl, isDev } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const parcelRoutes = require('./modules/parcels/parcel.routes');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS — strict origin
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// 3. Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. HTTP request logging (dev only)
if (isDev) {
  app.use(morgan('dev'));
}

// 5. Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// 6. Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);

// 7. 404 catch-all
app.use(notFoundHandler);

// 8. Centralized error handler (4-arg signature)
app.use(errorHandler);

module.exports = app;
