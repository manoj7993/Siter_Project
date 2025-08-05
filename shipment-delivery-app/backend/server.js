const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const accountRoutes = require('./routes/account');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// Initialize database connection
const db = connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting for general API
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/login', authLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON format' });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// API Routes following the specification
app.use('/login', authRoutes); // POST /login
app.use('/api/auth', authRoutes);
app.use('/shipments', shipmentRoutes); // All shipment endpoints
app.use('/account', accountRoutes); // All account endpoints
app.use('/settings', settingsRoutes); // All settings endpoints
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Boxinator Shipment Delivery API',
    version: '1.0.0',
    description: 'RESTful API for shipment delivery management',
    endpoints: {
      auth: 'POST /login',
      shipments: {
        list: 'GET /shipments',
        complete: 'GET /shipments/complete',
        cancelled: 'GET /shipments/cancelled',
        create: 'POST /shipments',
        details: 'GET /shipments/:shipment_id',
        customerShipments: 'GET /shipments/customer/:customer_id',
        update: 'PUT /shipments/:shipment_id',
        delete: 'DELETE /shipments/:shipment_id'
      },
      account: {
        get: 'GET /account/:account_id',
        update: 'PUT /account/:account_id',
        create: 'POST /account',
        delete: 'DELETE /account'
      },
      settings: {
        countries: 'GET /settings/countries',
        addCountry: 'POST /settings/countries/:country_id',
        updateCountry: 'PUT /settings/countries/:country_id'
      }
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Database connected and ready`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

module.exports = app;
