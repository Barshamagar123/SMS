import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'; // ✅ FIXED: Import from correct file
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import { PrismaClient } from '@prisma/client';


const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use('/api', globalLimiter);

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use(notFoundHandler); // ✅ FIXED: Use the notFoundHandler

// Global error handler
app.use(errorHandler); // ✅ FIXED: No need for 'as any'

// ==================== START SERVER ====================
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  console.log('👋 Server shutdown complete');
  process.exit(0);
});

startServer();

export default app;