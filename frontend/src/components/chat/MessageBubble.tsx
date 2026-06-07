// src/components/chat/MessageBubble.tsx

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/chatHelpers';
import { useAuth } from '../../hooks/useAuth';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isSent = message.senderId === user?.id;

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isSent
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm break-words">{message.message}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isSent ? 'justify-end' : 'justify-start'}`}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {isSent && (
            <span>
              {message.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;