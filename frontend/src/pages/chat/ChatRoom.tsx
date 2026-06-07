// src/pages/chat/ChatRoom.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useConversations } from '../../hooks/useConversations';
import { chatApi } from '../../api/api';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatHeader from '../../components/chat/ChatHeader';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import EmptyState from '../../components/chat/EmptyState';
import { Loader2 } from 'lucide-react';
import { formatDateGroup } from '../../utils/chatHelpers';

const ChatRoom: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { conversations } = useConversations();

  const {
    messages,
    sending,
    sendMessage,
    messagesEndRef,
    typingUser,
    sendTyping
  } = useChat(conversationId, parseInt(userId!));

  useEffect(() => {
    const existingConv = conversations.find(c => c.otherUser.id === parseInt(userId!));
    if (existingConv) {
      setConversationId(existingConv.id);
      setOtherUser(existingConv.otherUser);
      setLoading(false);
    } else {
      setOtherUser({ id: parseInt(userId!), name: 'Loading...', role: 'user' });
      setLoading(false);
    }
  }, [conversations, userId]);

  const renderMessages = () => {
    let lastDate = '';
    
    return messages.map((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;
      
      return (
        <React.Fragment key={message.id}>
          {showDate && (
            <div className="flex justify-center my-4">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {formatDateGroup(message.createdAt)}
              </span>
            </div>
          )}
          <MessageBubble message={message} />
        </React.Fragment>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <EmptyState title="User not found" message="The user you're trying to chat with doesn't exist" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      <ChatHeader userName={otherUser.name} userRole={otherUser.role} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Send a message to start the conversation" />
        ) : (
          <>
            {renderMessages()}
            {typingUser && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <ChatInput onSend={sendMessage} onTyping={sendTyping} sending={sending} />
    </div>
  );
};

export default ChatRoom;