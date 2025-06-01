import { createContext } from 'react';
import { NotificationFilterParams } from '@/lib/types';
import { Notification } from '@/services/notification.service';

export interface NotificationContextType {
  // Notification state
  notifications: Notification[];
  unreadCount: {
    total: number;
    byType?: Record<string, number>;
    byPriority?: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  
  // Notification actions
  fetchNotifications: (params?: NotificationFilterParams) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  
  // Notification filters
  filters: NotificationFilterParams;
  setFilters: (filters: NotificationFilterParams) => void;
}

// Create the context with a default undefined value
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook to use the notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Fix missing import
import { useContext } from 'react';
