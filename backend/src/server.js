import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import recipeRouter from './api/recipes.js';
import crawlerRouter from './api/crawler.js';
import adminRouter from './api/admin.js';
import { initializeDatabase } from './database/db.js';
import { startScheduler } from './scheduler/cronJobs.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const HOST = '0.0.0.0';

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Initialize database
await initializeDatabase();
logger.info('Database initialized');

// API Routes
app.use('/api/recipes', recipeRouter);
app.use('/api/crawler', crawlerRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server and scheduler
const server = app.listen(PORT, HOST, () => {
  logger.info(`
    ╔════════════════════════════════════════════════════════╗
    ║  Mix & Munch Backend Server                           ║
    ║  Recipe Crawler, Parser & Image Extractor             ║
    ╚════════════════════════════════════════════════════════╝
    
    Server: http://${HOST}:${PORT}
    API Docs: http://${HOST}:${PORT}/api/health
    Admin Panel: http://${HOST}:${PORT}/api/admin/dashboard
    
    Ctrl+C to stop
  `);
});

// Start scheduled crawlers and parsers
startScheduler();

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
