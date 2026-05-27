import ExamService from '../services/examService.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const toNumber = (val) => {
    if (!val)
        return NaN;
    return parseInt(String(val), 10);
};
// ================= EXAM TYPE METHODS =================
export const createExamType = async (req, res) => {
    try {
        const { name, description, weightage } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Exam type name is required' });
        }
        const examType = await ExamService.createExamType({ name, description, weightage });
        res.json({ success: true, message: 'Exam type created successfully', data: examType });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getAllExamTypes = async (req, res) => {
    try {
        const examTypes = await ExamService.getAllExamTypes();
        res.json({ success: true, data: examTypes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= EXAM SCHEDULE METHODS =================
export const createExam = async (req, res) => {
    try {
        const { examTypeId, classId, subjectId, academicYearId, name, examDate, maxMarks, passingMarks, description } = req.body;
        const missingFields = [];
        if (!examTypeId)
            missingFields.push('examTypeId');
        if (!classId)
            missingFields.push('classId');
        if (!subjectId)
            missingFields.push('subjectId');
        if (!academicYearId)
            missingFields.push('academicYearId');
        if (!name)
            missingFields.push('name');
        if (!examDate)
            missingFields.push('examDate');
        if (!maxMarks)
            missingFields.push('maxMarks');
        if (!passingMarks)
            missingFields.push('passingMarks');
        if (missingFields.length > 0) {
            return res.status(400).json({ success: false, message: `Missing fields: ${missingFields.join(', ')}` });
        }
        const exam = await ExamService.createExam({
            examTypeId: toNumber(examTypeId),
            classId: toNumber(classId),
            subjectId: toNumber(subjectId),
            academicYearId: toNumber(academicYearId),
            name,
            examDate,
            maxMarks: toNumber(maxMarks),
            passingMarks: toNumber(passingMarks),
            description
        });
        res.json({ success: true, message: 'Exam created successfully', data: exam });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getExamsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { academicYearId } = req.query;
        const classIdNum = toNumber(classId);
        if (isNaN(classIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid class ID' });
        }
        const yearId = academicYearId ? toNumber(academicYearId) : undefined;
        if (!yearId) {
            return res.status(400).json({ success: false, message: 'academicYearId is required' });
        }
        const exams = await ExamService.getExamsByClass(classIdNum, yearId);
        res.json({ success: true, data: exams });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getExamsForTeacher = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { academicYearId } = req.query;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const yearId = academicYearId ? toNumber(academicYearId) : undefined;
        if (!yearId) {
            return res.status(400).json({ success: false, message: 'academicYearId is required' });
        }
        const exams = await ExamService.getExamsForTeacher(userId, yearId);
        res.json({ success: true, data: exams });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= MARKS ENTRY METHODS =================
export const getStudentsForMarksEntry = async (req, res) => {
    try {
        const { examId } = req.params;
        const examIdNum = toNumber(examId);
        if (isNaN(examIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }
        const students = await ExamService.getStudentsForMarksEntry(examIdNum);
        res.json({ success: true, data: students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const enterMarks = async (req, res) => {
    try {
        const { examId } = req.params;
        const { marks } = req.body;
        const userId = req.user?.id;
        const examIdNum = toNumber(examId);
        if (isNaN(examIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }
        if (!marks || !Array.isArray(marks) || marks.length === 0) {
            return res.status(400).json({ success: false, message: 'Marks array is required' });
        }
        const results = await ExamService.enterMarks(examIdNum, marks, userId);
        res.json({ success: true, message: 'Marks entered successfully', data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getExamResults = async (req, res) => {
    try {
        const { examId } = req.params;
        const examIdNum = toNumber(examId);
        if (isNaN(examIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }
        const results = await ExamService.getExamResults(examIdNum);
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= LOCK/UNLOCK EXAM METHODS =================
export const lockExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const userId = req.user?.id;
        const examIdNum = toNumber(examId);
        if (isNaN(examIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }
        const exam = await ExamService.lockExam(examIdNum, userId);
        res.json({ success: true, message: 'Exam locked successfully', data: exam });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const unlockExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const examIdNum = toNumber(examId);
        if (isNaN(examIdNum)) {
            return res.status(400).json({ success: false, message: 'Invalid exam ID' });
        }
        const exam = await ExamService.unlockExam(examIdNum);
        res.json({ success: true, message: 'Exam unlocked successfully', data: exam });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= STUDENT EXAM RESULTS =================
export const getMyExamResults = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { academicYearId } = req.query;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const yearId = academicYearId ? toNumber(academicYearId) : undefined;
        const results = await ExamService.getStudentExamResults(student.id, yearId);
        res.json({ success: true, data: results });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ================= INITIALIZATION =================
export const initializeGrades = async (req, res) => {
    try {
        await ExamService.initializeGradeScales();
        res.json({ success: true, message: 'Grade scales initialized successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=examController.js.map