import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExamService {

  // ================= EXAM TYPE METHODS =================
  
  static async createExamType(data: { name: string; description?: string; weightage?: number }) {
    const existing = await prisma.examType.findUnique({
      where: { name: data.name }
    });
    
    if (existing) {
      throw new Error('Exam type already exists');
    }
    
    return prisma.examType.create({
      data: {
        name: data.name,
        description: data.description || null,
        weightage: data.weightage || 0
      }
    });
  }
  
  static async getAllExamTypes() {
    return prisma.examType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }
  
  // ================= EXAM SCHEDULE METHODS =================
  
  static async createExam(data: {
    examTypeId: number;
    classId: number;
    subjectId: number;
    academicYearId: number;
    name: string;
    examDate: string;
    maxMarks: number;
    passingMarks: number;
    description?: string;
  }) {
    const examType = await prisma.examType.findUnique({
      where: { id: data.examTypeId }
    });
    if (!examType) {
      throw new Error('Exam type not found');
    }
    
    const classData = await prisma.class.findUnique({
      where: { id: data.classId }
    });
    if (!classData) {
      throw new Error('Class not found');
    }
    
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId }
    });
    if (!subject) {
      throw new Error('Subject not found');
    }
    
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId }
    });
    if (!academicYear) {
      throw new Error('Academic year not found');
    }
    
    const existing = await prisma.exam.findFirst({
      where: {
        classId: data.classId,
        subjectId: data.subjectId,
        examTypeId: data.examTypeId,
        academicYearId: data.academicYearId
      }
    });
    
    if (existing) {
      throw new Error('Exam already exists for this class, subject, and exam type');
    }
    
    return prisma.exam.create({
      data: {
        examTypeId: data.examTypeId,
        classId: data.classId,
        subjectId: data.subjectId,
        academicYearId: data.academicYearId,
        name: data.name,
        examDate: new Date(data.examDate),
        maxMarks: data.maxMarks,
        passingMarks: data.passingMarks,
        description: data.description || null
      },
      include: {
        examType: true,
        class: true,
        subject: true
      }
    });
  }
  
  static async getExamsByClass(classId: number, academicYearId: number) {
    return prisma.exam.findMany({
      where: {
        classId,
        academicYearId
      },
      include: {
        examType: true,
        subject: true,
        results: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        examDate: 'asc'
      }
    });
  }
  
  static async getExamsForTeacher(teacherUserId: number, academicYearId: number) {
    const teacher = await prisma.teacher.findFirst({
      where: { userId: teacherUserId },
      include: {
        teacherAssignments: {
          where: { academicYearId },
          include: {
            classSubject: {
              include: {
                class: true,
                subject: true
              }
            }
          }
        }
      }
    });
    
    if (!teacher) return [];
    
    const classIds = teacher.teacherAssignments.map(ta => ta.classSubject.class.id);
    
    return prisma.exam.findMany({
      where: {
        classId: { in: classIds },
        academicYearId
      },
      include: {
        examType: true,
        subject: true,
        class: true
      },
      orderBy: {
        examDate: 'asc'
      }
    });
  }
  
  // ================= MARKS ENTRY METHODS =================
  
  static async getStudentsForMarksEntry(examId: number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: {
          include: {
            students: {
              where: { isActive: true },
              include: {
                user: {
                  select: { name: true }
                }
              },
              orderBy: { rollNumber: 'asc' }
            }
          }
        }
      }
    });
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    const existingResults = await prisma.examResult.findMany({
      where: { examId }
    });
    
    return exam.class.students.map(student => {
      const existing = existingResults.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        studentName: student.user.name,
        marksObtained: existing ? Number(existing.marksObtained) : null,
        remark: existing?.remark || null,
        resultId: existing?.id || null
      };
    });
  }
  
  static async getGrade(percentage: number): Promise<string> {
    const gradeScales = await prisma.gradeScale.findMany({
      where: { isActive: true },
      orderBy: { minPercentage: 'desc' }
    });
    
    for (const scale of gradeScales) {
      if (percentage >= scale.minPercentage && percentage <= scale.maxPercentage) {
        return scale.grade;
      }
    }
    
    return 'F';
  }
  
  static async enterMarks(
    examId: number,
    marks: { studentId: number; marksObtained: number; remark?: string }[],
    enteredBy: number
  ) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    if (exam.isLocked) {
      throw new Error('Exam is locked. Cannot edit marks.');
    }
    
    const results = [];
    
    for (const item of marks) {
      if (item.marksObtained < 0) {
        throw new Error(`Marks cannot be negative for student ${item.studentId}`);
      }
      if (item.marksObtained > exam.maxMarks) {
        throw new Error(`Marks cannot exceed ${exam.maxMarks} for student ${item.studentId}`);
      }
      
      const percentage = (item.marksObtained / exam.maxMarks) * 100;
      const grade = await this.getGrade(percentage);
      
      const existing = await prisma.examResult.findFirst({
        where: {
          examId,
          studentId: item.studentId
        }
      });
      
      if (existing) {
        const updated = await prisma.examResult.update({
          where: { id: existing.id },
          data: {
            marksObtained: item.marksObtained,
            percentage,
            grade,
            remark: item.remark || null,
            enteredBy
          }
        });
        results.push(updated);
      } else {
        const created = await prisma.examResult.create({
          data: {
            examId,
            studentId: item.studentId,
            marksObtained: item.marksObtained,
            percentage,
            grade,
            remark: item.remark || null,
            enteredBy
          }
        });
        results.push(created);
      }
    }
    
    return results;
  }
  
  static async getExamResults(examId: number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examType: true,
        subject: true,
        class: true,
        results: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            marksObtained: 'desc'
          }
        }
      }
    });
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    // ✅ FIX: Convert Decimal to number for comparison
    let rank = 1;
    let prevMarks = -1;
    let rankCounter = 1;
    
    const resultsWithRank = exam.results.map((result) => {
      // Convert Decimal to number
      const currentMarks = Number(result.marksObtained);
      
      if (currentMarks !== prevMarks) {
        rank = rankCounter;
      }
      prevMarks = currentMarks;
      rankCounter++;
      
      return {
        studentId: result.student.id,
        rollNumber: result.student.rollNumber,
        studentName: result.student.user.name,
        marksObtained: currentMarks,
        percentage: result.percentage,
        grade: result.grade,
        remark: result.remark,
        rank: rank
      };
    });
    
    // ✅ FIX: Convert Decimal to number for calculations
    const marks = exam.results.map(r => Number(r.marksObtained));
    const analytics = {
      totalStudents: exam.results.length,
      averageMarks: marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2) : 0,
      highestMarks: marks.length > 0 ? Math.max(...marks) : 0,
      lowestMarks: marks.length > 0 ? Math.min(...marks) : 0,
      passCount: exam.results.filter(r => Number(r.marksObtained) >= exam.passingMarks).length,
      failCount: exam.results.filter(r => Number(r.marksObtained) < exam.passingMarks).length,
      passPercentage: exam.results.length > 0 
        ? ((exam.results.filter(r => Number(r.marksObtained) >= exam.passingMarks).length / exam.results.length) * 100).toFixed(2)
        : 0
    };
    
    return {
      exam: {
        id: exam.id,
        name: exam.name,
        examType: exam.examType.name,
        subject: exam.subject.name,
        class: `${exam.class.name} ${exam.class.section}`,
        examDate: exam.examDate,
        maxMarks: exam.maxMarks,
        passingMarks: exam.passingMarks,
        isLocked: exam.isLocked
      },
      analytics,
      results: resultsWithRank
    };
  }
  
  static async lockExam(examId: number, lockedBy: number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    return prisma.exam.update({
      where: { id: examId },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy
      }
    });
  }
  
  static async unlockExam(examId: number) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId }
    });
    
    if (!exam) {
      throw new Error('Exam not found');
    }
    
    return prisma.exam.update({
      where: { id: examId },
      data: {
        isLocked: false,
        lockedAt: null,
        lockedBy: null
      }
    });
  }
  
  static async getStudentExamResults(studentId: number, academicYearId?: number) {
    const where: any = {
      studentId
    };
    
    if (academicYearId) {
      where.exam = { academicYearId };
    }
    
    const results = await prisma.examResult.findMany({
      where,
      include: {
        exam: {
          include: {
            examType: true,
            subject: true,
            class: true
          }
        }
      },
      orderBy: {
        exam: {
          examDate: 'asc'
        }
      }
    });
    
    return results.map(r => ({
      examId: r.exam.id,
      examName: r.exam.name,
      examType: r.exam.examType.name,
      subject: r.exam.subject.name,
      examDate: r.exam.examDate,
      maxMarks: r.exam.maxMarks,
      passingMarks: r.exam.passingMarks,
      marksObtained: Number(r.marksObtained),
      percentage: r.percentage,
      grade: r.grade,
      remark: r.remark
    }));
  }
  
  static async initializeGradeScales() {
    const scales = [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, description: 'Excellent' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89, description: 'Very Good' },
      { grade: 'B', minPercentage: 70, maxPercentage: 79, description: 'Good' },
      { grade: 'C', minPercentage: 60, maxPercentage: 69, description: 'Average' },
      { grade: 'D', minPercentage: 50, maxPercentage: 59, description: 'Pass' },
      { grade: 'F', minPercentage: 0, maxPercentage: 49, description: 'Fail' }
    ];
    
    for (const scale of scales) {
      await prisma.gradeScale.upsert({
        where: { grade: scale.grade },
        update: {},
        create: {
          grade: scale.grade,
          minPercentage: scale.minPercentage,
          maxPercentage: scale.maxPercentage,
          description: scale.description
        }
      });
    }
  }
}

export default ExamService;