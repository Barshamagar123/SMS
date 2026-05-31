import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use project root directory consistently
const PROJECT_ROOT = process.cwd();

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        path.join(PROJECT_ROOT, 'uploads/'),
        path.join(PROJECT_ROOT, 'uploads/students/'),
        path.join(PROJECT_ROOT, 'uploads/teachers/'),
        path.join(PROJECT_ROOT, 'uploads/documents/')
    ];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });
};

// Call this to create directories
createUploadDirs();

// ============================================
// STUDENT PROFILE PHOTO CONFIGURATION
// ============================================
const studentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(PROJECT_ROOT, 'uploads/students/');
        cb(null, dest);
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
const teacherStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(PROJECT_ROOT, 'uploads/teachers/');
        cb(null, dest);
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
export const uploadStudentPhoto = multer({
    storage: studentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: imageFileFilter
});

export const uploadTeacherPhoto = multer({
    storage: teacherStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: imageFileFilter
});

export const uploadMultiplePhotos = multer({
    storage: studentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
    fileFilter: imageFileFilter
});

export const uploadImage = multer({
    storage: studentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: imageFileFilter
});

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
        const dest = path.join(PROJECT_ROOT, 'uploads/documents/');
        cb(null, dest);
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
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: documentFileFilter
});