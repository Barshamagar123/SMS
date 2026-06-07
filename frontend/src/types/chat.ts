// src/types/chat.ts

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  message: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    role: string;
  };
  receiver?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Contact {
  id: number;
  name: string;
  email?: string;
  role: string;
  rollNumber?: string;
  subjects?: string[];
}