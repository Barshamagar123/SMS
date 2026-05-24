import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import teacherAssignmentRoutes from './routes/teacherAssignmentRoutes.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
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
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teacher-assignments', teacherAssignmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== START SERVER ====================
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth:              http://localhost:${PORT}/api/auth`);
      console.log(`📚 Subjects:          http://localhost:${PORT}/api/subjects`);
      console.log(`🏫 Classes:           http://localhost:${PORT}/api/classes`);
      console.log(`👩‍🏫 TeacherAssignments: http://localhost:${PORT}/api/teacher-assignments`);
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