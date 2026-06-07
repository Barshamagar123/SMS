// src/components/chat/ConversationItem.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type  { Conversation } from '../../types/chat';
import { formatChatTime } from '../../utils/chatHelpers';

interface ConversationItemProps {
  conversation: Conversation;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${conversation.otherUser.id}?convId=${conversation.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition border-b"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
        {conversation.otherUser.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-medium text-gray-800 truncate">{conversation.otherUser.name}</p>
          <span className="text-xs text-gray-400 ml-2">
            {formatChatTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
      </div>
      {conversation.unreadCount > 0 && (
        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
        </span>
      )}
    </div>
  );
};

export default ConversationItem;