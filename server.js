require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const seedData = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const roomRoutes = require('./routes/roomRoutes');
const guestRoutes = require('./routes/guestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// ============================
// DATABASE CONNECTION
// ============================
// NOTE: For Vercel, this promise may execute during "cold start" only.
connectDB().then(() => {
  console.log('🗄️  Database ready for operations');
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  // We don't exit the process here in serverless, just log the error
});

// ============================
// MIDDLEWARE
// ============================

// CORS
// This relies on CORS_ORIGIN being set correctly in Vercel environment variables
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request Logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================
// SEED DATABASE (OPTIONAL)
// ============================
if (process.env.SEED_DATABASE === 'true') {
  console.log('🌱 Seeding database...');
  seedData().catch(err => console.error('❌ Seeding failed:', err));
}

// ============================
// ROOT ROUTE
// ============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hotel Management API',
    version: '1.0.0',
    documentation: 'Visit /api/health to verify API status',
  });
});

// ============================
// SERVER HEALTH CHECK
// ============================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: {
      status: 'connected',
      host: process.env.MONGO_URI?.split('@')[1]?.split('/')[0] || 'unknown',
    },
  });
});

// ============================
// API HEALTH CHECK
// ============================
app.get('/api/health', (req, res) => {
  // Removed local PORT reference as it's not applicable in serverless
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    baseURL: `/api`, // Base URL is relative in Vercel
    endpoints: {
      rooms: {
        list: 'GET /api/rooms',
        create: 'POST /api/rooms',
        get: 'GET /api/rooms/:id',
        update: 'PUT /api/rooms/:id',
        delete: 'DELETE /api/rooms/:id',
      },
      guests: {
        list: 'GET /api/guests',
        create: 'POST /api/guests',
        get: 'GET /api/guests/:id',
        update: 'PUT /api/guests/:id',
        delete: 'DELETE /api/guests/:id',
        bookings: 'GET /api/guests/:id/bookings',
      },
      bookings: {
        list: 'GET /api/bookings',
        create: 'POST /api/bookings',
        get: 'GET /api/bookings/:id',
        update: 'PUT /api/bookings/:id',
        delete: 'DELETE /api/bookings/:id',
      },
    },
  });
});

// ============================
// API ROUTES
// ============================
app.use('/api/rooms', roomRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/bookings', bookingRoutes);

// ============================
// 404 HANDLER
// ============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    availableRoutes: {
      health: 'GET /health',
      apiHealth: 'GET /api/health',
      documentation: 'GET /',
    },
  });
});

// ============================
// ERROR HANDLER (MUST BE LAST)
// ============================
app.use(errorHandler);

// ============================
// SERVERLESS EXPORT (REPLACES app.listen)
// ============================
// This is the critical change: export the Express app instance so Vercel can handle the incoming requests.
module.exports = app;

// NOTE: The `app.listen` block and all process handlers below it have been REMOVED
// as they are handled by the Vercel serverless runtime.
