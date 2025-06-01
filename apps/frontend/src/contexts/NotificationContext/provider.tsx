import React, { useState, useEffect, useCallback } from 'react';
import { NotificationContext, NotificationContextType } from './context';
import notificationService, { Notification } from '@/services/notification.service';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext/context';
import {
  NotificationFilterParams
} from '@/lib/types';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Authentication context to check if user is logged in
  const authContext = React.useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated || false;
  const user = authContext?.user || null;

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<{
    total: number;
    byType?: Record<string, number>;
    byPriority?: Record<string, number>;
  }>({ total: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Notification filters
  const [filters, setFilters] = useState<NotificationFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Fetch notifications with pagination and filtering
  const fetchNotifications = useCallback(async (params?: NotificationFilterParams) => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Use the current user's ID when fetching notifications
      const response = await notificationService.getUserNotifications(user.id, params || filters);
      setNotifications(response.items || []);
      setPagination({
        currentPage: response.metadata.currentPage,
        totalPages: response.metadata.totalPages,
        totalItems: response.metadata.totalItems,
        itemsPerPage: response.metadata.itemsPerPage
      });

      // Update filters if params were provided
      if (params) {
        setFilters(params);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch notifications');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters, user]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount({ total: 0 });
      return;
    }

    try {
      // Use the current user's ID when fetching unread count
      const count = await notificationService.getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      // Don't reset unread count on error to prevent UI flicker
    }
  }, [isAuthenticated, user]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markNotificationAsRead(id);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to mark notification ${id} as read`);
      }
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAllNotificationsAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );

      // Reset unread count
      setUnreadCount({ total: 0 });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to mark all notifications as read');
      }
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.deleteNotification(id);

      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      // Refresh unread count if needed
      const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
      if (wasUnread) {
        fetchUnreadCount();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to delete notification ${id}`);
      }
    }
  }, [isAuthenticated, notifications, fetchUnreadCount]);

  // Delete all notifications for current user
  const deleteAllNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      await notificationService.deleteAllNotificationsForUser(user.id);

      // Update local state
      setNotifications([]);
      setUnreadCount({ total: 0 });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete all notifications');
      }
    }
  }, [isAuthenticated, user]);

  // Initial data fetch when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Set up polling for unread count (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Context value
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    filters,
    setFilters
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
