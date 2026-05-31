import express from 'express';
import dotenv from "dotenv";
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FILE SERVING ====================
// Use project root for consistent file serving
const PROJECT_ROOT = process.cwd();
const uploadsPath = path.join(PROJECT_ROOT, 'uploads');

// Create upload directories if they don't exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Created uploads directory at: ${uploadsPath}`);
}

const studentsUploadsPath = path.join(uploadsPath, 'students');
const teachersUploadsPath = path.join(uploadsPath, 'teachers');
const documentsUploadsPath = path.join(uploadsPath, 'documents');

if (!fs.existsSync(studentsUploadsPath)) {
  fs.mkdirSync(studentsUploadsPath, { recursive: true });
  console.log(`📁 Created students uploads directory`);
}
if (!fs.existsSync(teachersUploadsPath)) {
  fs.mkdirSync(teachersUploadsPath, { recursive: true });
  console.log(`📁 Created teachers uploads directory`);
}
if (!fs.existsSync(documentsUploadsPath)) {
  fs.mkdirSync(documentsUploadsPath, { recursive: true });
  console.log(`📁 Created documents uploads directory`);
}

// Serve static files from the uploads directory

// Replace it with:
app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
}, express.static(uploadsPath));
console.log(`📁 Serving static files from: ${uploadsPath}`);
console.log(`📁 Students photos URL: http://localhost:${PORT}/uploads/students/`);

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

// Debug endpoint to check uploaded files
app.get('/debug/uploads', (req, res) => {
  const studentsPath = path.join(uploadsPath, 'students');
  let files: string[] = [];
  
  if (fs.existsSync(studentsPath)) {
    files = fs.readdirSync(studentsPath);
  }
  
  res.json({
    success: true,
    uploadsPath: uploadsPath,
    studentsPath: studentsPath,
    files: files,
    fileCount: files.length,
    staticUrl: `http://localhost:${PORT}/uploads/students/`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler - Make sure this is AFTER all routes
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
      console.log(`📁 Uploads URL: http://localhost:${PORT}/uploads`);
      console.log(`🐛 Debug URL: http://localhost:${PORT}/debug/uploads`);
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