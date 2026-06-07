// backend/src/services/chatService.ts

import { PrismaClient } from '@prisma/client';
import { ConversationWithUser } from '../types/chat.js';

const prisma = new PrismaClient();

export class ChatService {

  static async getOrCreateConversation(user1Id: number, user2Id: number) {
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: user1Id, participant2Id: user2Id },
          { participant1Id: user2Id, participant2Id: user1Id }
        ]
      }
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: user1Id,
          participant2Id: user2Id
        }
      });
    }
    
    return conversation;
  }

  static async getConversationById(conversationId: number, userId: number) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });
    return conversation;
  }

  static async getUserConversations(userId: number): Promise<ConversationWithUser[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ],
        isActive: true
      },
      include: {
        participant1: {
          select: { id: true, name: true, email: true, role: true }
        },
        participant2: {
          select: { id: true, name: true, email: true, role: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
    
    const results: ConversationWithUser[] = [];
    
    for (const conv of conversations) {
      const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
      
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          receiverId: userId,
          isRead: false,
          isDeleted: false
        }
      });
      
      results.push({
        id: conv.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role
        },
        lastMessage: conv.messages[0]?.message || '',
        lastMessageAt: conv.messages[0]?.createdAt || conv.lastMessageAt,
        unreadCount
      });
    }
    
    return results;
  }

  static async getMessages(conversationId: number, userId: number, limit: number = 50, offset: number = 0) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });
    
    const messages = await prisma.message.findMany({
      where: { 
        conversationId: conversationId, 
        isDeleted: false 
      },
      include: {
        sender: { 
          select: { id: true, name: true, role: true } 
        },
        receiver: { 
          select: { id: true, name: true, role: true } 
        }
      },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });
    
    return messages;
  }

  static async sendMessage(
    conversationId: number, 
    senderId: number, 
    receiverId: number, 
    message: string, 
    attachmentUrl?: string, 
    attachmentType?: string
  ) {
    const msg = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        receiverId,
        message,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null
      },
      include: {
        sender: { 
          select: { id: true, name: true, role: true } 
        },
        receiver: { 
          select: { id: true, name: true, role: true } 
        }
      }
    });
    
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: message, lastMessageAt: new Date() }
    });
    
    return msg;
  }

  static async markAsRead(messageId: number, userId: number) {
    const message = await prisma.message.findFirst({
      where: { 
        id: messageId, 
        receiverId: userId 
      }
    });
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() },
      include: {
        sender: { select: { id: true, name: true } }
      }
    });
    
    return updated;
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
        isDeleted: false
      }
    });
    return count;
  }

  static async getStudentTeachers(studentUserId: number) {
    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
      include: { class: true }
    });
    
    if (!student) throw new Error('Student not found');
    
    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: {
        classSubject: { classId: student.classId },
        academicYear: { isActive: true }
      },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        classSubject: { include: { subject: true } }
      }
    });
    
    const teachersMap = new Map();
    teacherAssignments.forEach((ta: any) => {
      if (!teachersMap.has(ta.teacher.user.id)) {
        teachersMap.set(ta.teacher.user.id, {
          id: ta.teacher.user.id,
          name: ta.teacher.user.name,
          email: ta.teacher.user.email,
          role: 'TEACHER',
          subjects: [ta.classSubject.subject.name]
        });
      } else {
        teachersMap.get(ta.teacher.user.id).subjects.push(ta.classSubject.subject.name);
      }
    });
    
    return Array.from(teachersMap.values());
  }

  static async getTeacherStudents(teacherUserId: number) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherUserId }
    });
    
    if (!teacher) throw new Error('Teacher not found');
    
    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: { 
        teacherId: teacher.id, 
        academicYear: { isActive: true } 
      },
      include: {
        classSubject: {
          include: {
            class: {
              include: {
                students: {
                  include: { 
                    user: { select: { id: true, name: true, role: true } } 
                  },
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
    });
    
    const studentsMap = new Map();
    teacherAssignments.forEach((ta: any) => {
      if (ta.classSubject?.class?.students) {
        ta.classSubject.class.students.forEach((student: any) => {
          if (!studentsMap.has(student.user.id)) {
            studentsMap.set(student.user.id, {
              id: student.user.id,
              name: student.user.name,
              role: 'STUDENT',
              rollNumber: student.rollNumber
            });
          }
        });
      }
    });
    
    return Array.from(studentsMap.values());
  }

  static async deleteMessage(messageId: number, userId: number) {
    const message = await prisma.message.findFirst({
      where: { 
        id: messageId, 
        senderId: userId 
      }
    });
    
    if (!message) throw new Error('Message not found');
    
    const deleted = await prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, deletedFor: userId }
    });
    
    return deleted;
  }
}

export default ChatService;