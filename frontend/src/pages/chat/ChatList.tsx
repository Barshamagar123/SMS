// src/pages/chat/ChatList.tsx

import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Users, Loader2 } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { useChatSocket } from '../../hooks/useChatSocket';
import ConversationItem from '../../components/chat/ConversationItem';
import EmptyState from '../../components/chat/EmptyState';
import { chatApi } from '../../api/api';
import type { Contact } from '../../types/chat';
import { useAuth } from '../../hooks/useAuth';

const ChatList: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loading, refetch, unreadCount } = useConversations();
  const { newMessage } = useChatSocket();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (newMessage) {
      refetch();
    }
  }, [newMessage, refetch]);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await chatApi.getContacts();
      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleShowContacts = () => {
    setShowContacts(true);
    fetchContacts();
  };

  const handleBackToConversations = () => {
    setShowContacts(false);
    setSearchTerm('');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {showContacts ? 'New Chat' : 'Messages'}
          </h1>
          {!showContacts ? (
            <button
              onClick={handleShowContacts}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <Users size={20} />
            </button>
          ) : (
            <button
              onClick={handleBackToConversations}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back
            </button>
          )}
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={showContacts ? "Search contacts..." : "Search conversations..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showContacts ? (
          loadingContacts ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => window.location.href = `/chat/${contact.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition border-b"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                  {contact.subjects && (
                    <p className="text-xs text-gray-400 mt-1">{contact.subjects.join(', ')}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No contacts found" message="No users available to chat with" />
          )
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))
        ) : (
          <EmptyState 
            title="No messages yet" 
            message="Start a conversation by clicking the + button" 
          />
        )}
      </div>
    </div>
  );
};

export default ChatList;