import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads/'),
        path.join(__dirname, '../uploads/students/'),
        path.join(__dirname, '../uploads/teachers/'),
        path.join(__dirname, '../uploads/documents/')
    ];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
// Call this to create directories
createUploadDirs();
// ============================================
// STUDENT PROFILE PHOTO CONFIGURATION
// ============================================
// Configure storage for student photos
const studentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/students/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `student-${uniqueSuffix}${ext}`);
    }
});
// ============================================
// TEACHER PROFILE PHOTO CONFIGURATION
// ============================================
// Configure storage for teacher photos
const teacherStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/teachers/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `teacher-${uniqueSuffix}${ext}`);
    }
});
// ============================================
// FILE FILTER (Common for all images)
// ============================================
// File filter for images only
const imageFileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
};
// ============================================
// EXPORT MULTER MIDDLEWARES
// ============================================
// For single student profile photo upload (max 5MB)
export const uploadStudentPhoto = multer({
    storage: studentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter
});
// For single teacher profile photo upload (max 5MB)
export const uploadTeacherPhoto = multer({
    storage: teacherStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter
});
// For multiple file uploads (max 10MB total)
export const uploadMultiplePhotos = multer({
    storage: studentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5 // Max 5 files
    },
    fileFilter: imageFileFilter
});
// Generic upload for any image
export const uploadImage = multer({
    storage: studentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: imageFileFilter
});
// For document uploads (PDF, DOC, etc.)
const documentFileFilter = (req, file, cb) => {
    const allowedDocTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedDocTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedDocTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only documents (pdf, doc, docx) and images are allowed'));
};
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/documents/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${uniqueSuffix}${ext}`);
    }
});
export const uploadDocument = multer({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: documentFileFilter
});
//# sourceMappingURL=multerConfig.js.map