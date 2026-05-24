import { Subject } from '@prisma/client';
export declare class SubjectService {
    static createSubject(data: {
        name: string;
        code: string;
        description?: string;
    }): Promise<Subject>;
    static getAllSubjects(onlyActive?: boolean): Promise<Subject[]>;
    static getSubjectById(id: number): Promise<Subject | null>;
    static updateSubject(id: number, data: {
        name?: string;
        code?: string;
        description?: string;
        isActive?: boolean;
    }): Promise<Subject>;
    static deleteSubject(id: number): Promise<void>;
    static subjectExists(id: number): Promise<boolean>;
}
export default SubjectService;
