// backend/src/types/chat.ts

export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  lastMessage?: string;
  lastMessageAt: Date;
  isActive: boolean;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  message: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface ConversationWithUser {
  id: number;
  otherUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}