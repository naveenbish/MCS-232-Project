import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import logger from './config/logger';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initializeSocket } from './config/socket';
import { initializeRazorpay } from './config/razorpay';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/authRoutes';
import foodRoutes from './routes/foodRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';

/**
 * Create Express application
 */
const app: Application = express();
const server = http.createServer(app);

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 204
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(config.COOKIE_SECRET));

// Request logging
app.use(requestLogger);

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static('uploads'));

// Rate limiting (only in production)
if (config.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

/**
 * Health Check Routes
 */
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    version: config.API_VERSION,
  });
});

/**
 * API Routes
 */
const API_PREFIX = `/api/${config.API_VERSION}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/food`, foodRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Initialize Services
 */
const initializeServices = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Razorpay (optional - won't fail if credentials not configured)
    try {
      initializeRazorpay();
    } catch (error) {
      logger.warn('Razorpay initialization skipped - configure credentials to enable payment features');
    }

    // Initialize Socket.IO
    initializeSocket(server);

    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
};

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Initialize all services
    await initializeServices();

    // Start server
    server.listen(config.PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 CraveCart Backend Server Started`);
      logger.info(`📍 Server: http://localhost:${config.PORT}`);
      logger.info(`📍 API: http://localhost:${config.PORT}${API_PREFIX}`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
      logger.info(`⚡ Socket.IO: Enabled`);
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Disconnect from database
    await disconnectDatabase();

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in development
  if (config.NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Exit the process as the application is in an unknown state
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
startServer();

export default app;
