import ClassService from '../services/classService.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Safe helper — req.params values are always strings at runtime
const toInt = (val) => parseInt(val, 10);
// ============================================
// ADMIN ONLY - Create Class
// ============================================
export const createClass = async (req, res) => {
    try {
        const { name, section } = req.body;
        if (!name || !section) {
            return res.status(400).json({
                success: false,
                message: 'Name and section are required'
            });
        }
        const newClass = await ClassService.createClass({ name, section });
        return res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    }
    catch (error) {
        const status = error.message.includes('already exists') ? 409 : 500;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// Get All Classes (All authenticated users)
// ============================================
export const getAllClasses = async (req, res) => {
    try {
        const classes = await ClassService.getAllClasses();
        return res.status(200).json({
            success: true,
            data: classes
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// Get Single Class with Details
// ============================================
export const getClassById = async (req, res) => {
    try {
        const classData = await ClassService.getClassById(toInt(req.params.id));
        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: classData
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// ADMIN ONLY - Update Class
// ============================================
export const updateClass = async (req, res) => {
    try {
        const { name, section } = req.body;
        const updatedClass = await ClassService.updateClass(toInt(req.params.id), { name, section });
        return res.status(200).json({
            success: true,
            message: 'Class updated successfully',
            data: updatedClass
        });
    }
    catch (error) {
        let status = 500;
        if (error.message.includes('not found'))
            status = 404;
        else if (error.message.includes('already exists'))
            status = 409;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// ADMIN ONLY - Delete Class
// ============================================
export const deleteClass = async (req, res) => {
    try {
        await ClassService.deleteClass(toInt(req.params.id));
        return res.status(200).json({
            success: true,
            message: 'Class deleted successfully'
        });
    }
    catch (error) {
        let status = 500;
        if (error.message.includes('not found'))
            status = 404;
        else if (error.message.includes('Cannot delete'))
            status = 400;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// Get Subjects for a Class (All roles with restrictions)
// ============================================
export const getSubjectsForClass = async (req, res) => {
    try {
        const classId = toInt(req.params.classId);
        const user = req.user;
        // STUDENT — can only view subjects for their own class
        if (user?.role === 'STUDENT') {
            const student = await prisma.student.findFirst({
                where: { userId: user.id, classId }
            });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view subjects for your own class'
                });
            }
        }
        // PARENT: extend when StudentParent model is added
        // For now, parents can view any class (restrict here when model exists)
        const data = await ClassService.getSubjectsForClass(classId);
        return res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        const status = error.message.includes('not found') ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// ADMIN ONLY - Assign Subject to Class
// ============================================
export const assignSubjectToClass = async (req, res) => {
    try {
        const classId = toInt(req.params.classId);
        const { subjectId } = req.body;
        if (!subjectId) {
            return res.status(400).json({
                success: false,
                message: 'subjectId is required'
            });
        }
        const assignment = await ClassService.assignSubjectToClass(classId, parseInt(subjectId, 10));
        return res.status(201).json({
            success: true,
            message: 'Subject assigned to class successfully',
            data: assignment
        });
    }
    catch (error) {
        let status = 500;
        if (error.message.includes('not found'))
            status = 404;
        else if (error.message.includes('already assigned'))
            status = 409;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
// ============================================
// ADMIN ONLY - Remove Subject from Class
// ============================================
export const removeSubjectFromClass = async (req, res) => {
    try {
        const classId = toInt(req.params.classId);
        const subjectId = toInt(req.params.subjectId);
        await ClassService.removeSubjectFromClass(classId, subjectId);
        return res.status(200).json({
            success: true,
            message: 'Subject removed from class successfully'
        });
    }
    catch (error) {
        let status = 500;
        if (error.message.includes('not assigned'))
            status = 404;
        else if (error.message.includes('Cannot remove'))
            status = 400;
        return res.status(status).json({
            success: false,
            message: error.message
        });
    }
};
//# sourceMappingURL=classController.js.map