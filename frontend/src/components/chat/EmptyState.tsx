// src/components/chat/EmptyState.tsx

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <MessageCircle size={48} className="text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{message}</p>
    </div>
  );
};

export default EmptyState;