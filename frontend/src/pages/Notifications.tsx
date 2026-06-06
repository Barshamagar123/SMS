// src/pages/Notifications.tsx

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, FileText, Award, Calendar, Megaphone, Loader2, Trash2 } from 'lucide-react';
import { notificationApi } from '../api/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const { markAsRead: wsMarkAsRead, markAllAsRead: wsMarkAllAsRead } = useWebSocket();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications(page, 20);
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      wsMarkAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => prev - 1);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      wsMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!notifications.find(n => n.id === id)?.isRead) {
        setUnreadCount(prev => prev - 1);
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    if (!confirm('Delete all notifications? This action cannot be undone.')) return;
    try {
      await notificationApi.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT_CREATED':
        return <FileText size={20} className="text-blue-500" />;
      case 'ASSIGNMENT_SUBMITTED':
        return <Check size={20} className="text-green-500" />;
      case 'ASSIGNMENT_GRADED':
        return <Award size={20} className="text-purple-500" />;
      case 'HOLIDAY':
        return <Calendar size={20} className="text-orange-500" />;
      default:
        return <Megaphone size={20} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with school announcements and updates</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{total}</p>
          <p className="text-xs text-gray-600">Total Notifications</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{unreadCount}</p>
          <p className="text-xs text-gray-600">Unread</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-lg p-5 transition hover:shadow-xl ${
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(notification.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 20 >= total}
            className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;