/**
 * AVRS Platform - Main Server
 * Autonomous Venture Replication System
 * Express.js + PostgreSQL + Real-time Analytics
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { initializeDatabase } from './db/connection';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many auth attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// STATIC FILES
// ============================================================================

// Serve static files from public directory
app.use(express.static('public'));

// ============================================================================
// ROUTES
// ============================================================================

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AVRS Platform',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Root endpoint - serve index.html
app.get('/', (req: Request, res: Response) => {
  res.sendFile('public/index.html', { root: __dirname + '/..' });
});

// API info endpoint
app.get('/api/info', (req: Request, res: Response) => {
  res.json({
    name: 'AVRS - Autonomous Venture Replication System',
    version: '1.0.0',
    description: 'Platform for managing 15-venture portfolio with autonomous operations',
    endpoints: {
      health: '/health',
      api: '/api',
      ventures: '/api/ventures',
      operations: '/api/operations',
      analytics: '/api/analytics',
      framework: '/api/framework'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 AVRS - Autonomous Venture Replication System            ║
║   Server running on http://localhost:${PORT}                     ║
║                                                              ║
║   Endpoints:                                                 ║
║   - GET  /health              - Health check                ║
║   - GET  /api/ventures        - List all ventures           ║
║   - POST /api/ventures        - Create new venture          ║
║   - GET  /api/analytics/portfolio - Portfolio metrics       ║
║   - GET  /api/framework/summary    - Execution summary      ║
║                                                              ║
║   Database: PostgreSQL                                       ║
║   Features: 15-venture portfolio, autonomous ops, analytics ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
