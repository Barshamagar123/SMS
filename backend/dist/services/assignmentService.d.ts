export declare class AssignmentService {
    static createAssignment(data: {
        teacherId: number;
        classId: number;
        subjectId: number;
        academicYearId: number;
        isPrimary?: boolean;
    }): Promise<{
        id: number;
        teacher: {
            id: number;
            name: string;
            employeeId: string;
        };
        class: {
            id: number;
            name: string;
            section: string;
            displayName: string;
        };
        subject: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
            description: string | null;
            updatedAt: Date;
        };
        academicYear: string;
        isPrimary: boolean;
        assignedAt: Date;
    }>;
    static getAllAssignments(teacherId?: number): Promise<{
        id: number;
        teacher: {
            id: number;
            name: string;
            employeeId: string;
        };
        class: {
            id: number;
            name: string;
            section: string;
            displayName: string;
        };
        subject: {
            id: number;
            name: string;
            isActive: boolean;
            createdAt: Date;
            code: string;
            description: string | null;
            updatedAt: Date;
        };
        academicYear: string;
        isPrimary: boolean;
        assignedAt: Date;
    }[]>;
    static getTeacherClasses(teacherId: number): Promise<{
        classId: number;
        className: string;
        subject: {
            id: number;
            name: string;
            code: string;
        };
        isPrimary: boolean;
    }[]>;
    static deleteAssignment(id: number): Promise<{
        teacherName: string;
        className: string;
        subjectName: string;
    }>;
    static assignmentExists(id: number): Promise<boolean>;
}
export default AssignmentService;
