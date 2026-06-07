// src/components/chat/ChatHeader.tsx

import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  userName: string;
  userRole: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ userName, userRole, isOnline }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <button
        onClick={() => navigate('/chat')}
        className="p-1 hover:bg-gray-100 rounded-lg transition"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
          {userName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{userName}</h2>
          <p className="text-xs text-gray-500 capitalize">{userRole}</p>
        </div>
      </div>
      {isOnline && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;