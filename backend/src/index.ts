import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';


import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import teacherAssignmentRoutes from './routes/teacherAssignmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import examRoutes from './routes/examRoutes.js';
import reportCardRoutes from './routes/reportCardRoutes.js';



import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ==================== STATIC FILE SERVING ====================
// Check if uploads directory exists, create if not
const uploadsDir = path.join(process.cwd(), 'uploads');
const studentsUploadsDir = path.join(uploadsDir, 'students');
const teachersUploadsDir = path.join(uploadsDir, 'teachers');



// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global rate limiting
app.use('/api', globalLimiter);

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/exams', examRoutes);


app.use('/api/report-cards', reportCardRoutes);


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


async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;