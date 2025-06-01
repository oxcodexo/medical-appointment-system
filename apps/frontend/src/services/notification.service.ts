import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';
import { User, PaginationParams, PaginationResponse, NotificationFilterParams, NotificationTemplateFilterParams } from '@/lib/types';

// Define interfaces for notification-related data
export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'in-app' | 'push';
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledFor: string | null;
  expiresAt: string | null;
  templateId: number | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  variables: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields from API
  formattedTitle?: string;
  formattedContent?: string;
  template?: NotificationTemplate;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  description: string;
  subject: string;
  content: string;
  type: string;
  variables: string[];
  channels: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  userId: number;
  type: string;
  title: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  channel?: 'email' | 'sms' | 'in-app' | 'push';
  scheduledFor?: string;
  expiresAt?: string;
  templateId?: number;
  templateVariables?: Record<string, string>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationError {
  message: string;
  status?: number;
}

/**
 * Notification service for handling notification-related operations
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  /**
   * Get the singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): NotificationError {
    let errorMessage = defaultMessage;
    let errorStatus: number | undefined = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data?.message as string || errorMessage;
      errorStatus = error.response.status;
    }
    
    return {
      message: errorMessage,
      status: errorStatus
    };
  }

  /**
   * Get all notifications for the current user with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Promise with paginated notifications response
   */
  public async getUserNotifications(userId?: number, params?: NotificationFilterParams): Promise<PaginationResponse<Notification>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Add pagination parameters
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Add filter parameters
        if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
        if (params.type) {
          if (Array.isArray(params.type)) {
            params.type.forEach(type => queryParams.append('type', type));
          } else {
            queryParams.append('type', params.type);
          }
        }
        if (params.priority) {
          if (Array.isArray(params.priority)) {
            params.priority.forEach(priority => queryParams.append('priority', priority));
          } else {
            queryParams.append('priority', params.priority);
          }
        }
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.channel) {
          if (Array.isArray(params.channel)) {
            params.channel.forEach(channel => queryParams.append('channel', channel));
          } else {
            queryParams.append('channel', params.channel);
          }
        }
        if (params.deliveryStatus) {
          if (Array.isArray(params.deliveryStatus)) {
            params.deliveryStatus.forEach(status => queryParams.append('deliveryStatus', status));
          } else {
            queryParams.append('deliveryStatus', params.deliveryStatus);
          }
        }
      }
      
      // If userId is provided, use the user-specific endpoint, otherwise use the current user endpoint
      const baseUrl = userId ? `/notifications/user/${userId}` : '/notifications';
      const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response: AxiosResponse<PaginationResponse<Notification>> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch notifications');
    }
  }

  /**
   * Get notification by ID
   * @param id Notification ID
   * @returns Promise with notification data
   */
  public async getNotificationById(id: number): Promise<Notification> {
    try {
      const response: AxiosResponse<Notification> = await apiService.get(`/notifications/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch notification with ID ${id}`);
    }
  }

  /**
   * Create a new notification
   * @param notificationData Notification data
   * @returns Promise with created notification data
   */
  public async createNotification(notificationData: NotificationData): Promise<Notification> {
    try {
      const response: AxiosResponse<Notification> = await apiService.post('/notifications', notificationData);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create notification');
    }
  }

  /**
   * Mark notification as read
   * @param id Notification ID
   * @returns Promise with updated notification data
   */
  public async markNotificationAsRead(id: number): Promise<Notification> {
    try {
      const response: AxiosResponse<Notification> = await apiService.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to mark notification with ID ${id} as read`);
    }
  }

  /**
   * Mark all notifications as read
   * @returns Promise with success status
   */
  public async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      await apiService.put('/notifications/read-all');
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   * @param id Notification ID
   * @returns Promise with success status
   */
  public async deleteNotification(id: number): Promise<boolean> {
    try {
      await apiService.delete(`/notifications/${id}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to delete notification with ID ${id}`);
    }
  }

  /**
   * Get unread notifications with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Promise with paginated unread notifications response
   */
  public async getUnreadNotifications(params?: NotificationFilterParams): Promise<PaginationResponse<Notification>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Add pagination parameters
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Add filter parameters
        if (params.type) {
          if (Array.isArray(params.type)) {
            params.type.forEach(type => queryParams.append('type', type));
          } else {
            queryParams.append('type', params.type);
          }
        }
        if (params.priority) {
          if (Array.isArray(params.priority)) {
            params.priority.forEach(priority => queryParams.append('priority', priority));
          } else {
            queryParams.append('priority', params.priority);
          }
        }
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.channel) {
          if (Array.isArray(params.channel)) {
            params.channel.forEach(channel => queryParams.append('channel', channel));
          } else {
            queryParams.append('channel', params.channel);
          }
        }
      }
      
      const url = `/notifications/unread${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<PaginationResponse<Notification>> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch unread notifications');
    }
  }

  /**
   * Get unread notifications count with detailed breakdown
   * @returns Promise with unread count and breakdown by type and priority
   */
  public async getUnreadNotificationsCount(userId?: number): Promise<{ 
    total: number; 
    byType?: Record<string, number>;
    byPriority?: Record<string, number>;
  }> {
    try {
      // If userId is provided, use it, otherwise use the current user's endpoint
      const endpoint = userId ? `/notifications/user/${userId}/unread-count` : '/notifications/unread-count';
      
      // Add detailed parameter if needed
      const queryParams = new URLSearchParams();
      queryParams.append('detailed', 'true');
      
      const url = `${endpoint}?${queryParams.toString()}`;
      
      const response: AxiosResponse<{ 
        total: number; 
        byType?: Record<string, number>;
        byPriority?: Record<string, number>;
      }> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch unread notifications count');
    }
  }

  /**
   * Get notifications by type with pagination and filtering
   * @param type Notification type
   * @param params Pagination and filter parameters
   * @returns Promise with paginated notifications response
   */
  public async getNotificationsByType(type: string, params?: NotificationFilterParams): Promise<PaginationResponse<Notification>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Add pagination parameters
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Add filter parameters
        if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
        if (params.priority) {
          if (Array.isArray(params.priority)) {
            params.priority.forEach(priority => queryParams.append('priority', priority));
          } else {
            queryParams.append('priority', params.priority);
          }
        }
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.channel) {
          if (Array.isArray(params.channel)) {
            params.channel.forEach(channel => queryParams.append('channel', channel));
          } else {
            queryParams.append('channel', params.channel);
          }
        }
      }
      
      const url = `/notifications/type/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<PaginationResponse<Notification>> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch notifications of type ${type}`);
    }
  }
  
  /**
   * Get notifications by related entity
   * @param entityType Entity type
   * @param entityId Entity ID
   * @param params Pagination and filter parameters
   * @returns Promise with paginated notifications response
   */
  public async getNotificationsByRelatedEntity(
    entityType: string, 
    entityId: string, 
    params?: NotificationFilterParams
  ): Promise<PaginationResponse<Notification>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Add pagination parameters
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Add filter parameters
        if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
        if (params.type) {
          if (Array.isArray(params.type)) {
            params.type.forEach(type => queryParams.append('type', type));
          } else {
            queryParams.append('type', params.type);
          }
        }
        if (params.priority) {
          if (Array.isArray(params.priority)) {
            params.priority.forEach(priority => queryParams.append('priority', priority));
          } else {
            queryParams.append('priority', params.priority);
          }
        }
      }
      
      const url = `/notifications/entity/${entityType}/${entityId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<PaginationResponse<Notification>> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch notifications for ${entityType} with ID ${entityId}`);
    }
  }

  /**
   * Get notification templates with pagination and filtering
   * @param params Pagination and filter parameters
   * @returns Promise with paginated notification templates response
   */
  public async getNotificationTemplates(params?: NotificationTemplateFilterParams): Promise<PaginationResponse<NotificationTemplate>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        // Add pagination parameters
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        // Add filter parameters
        if (params.name) queryParams.append('name', params.name);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params.type) {
          if (Array.isArray(params.type)) {
            params.type.forEach(type => queryParams.append('type', type));
          } else {
            queryParams.append('type', params.type);
          }
        }
        if (params.channel) {
          if (Array.isArray(params.channel)) {
            params.channel.forEach(channel => queryParams.append('channel', channel));
          } else {
            queryParams.append('channel', params.channel);
          }
        }
      }
      
      const url = `/notification-templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<PaginationResponse<NotificationTemplate>> = await apiService.get(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch notification templates');
    }
  }

  /**
   * Get notification template by ID
   * @param id Template ID
   * @returns Promise with notification template data
   */
  public async getNotificationTemplateById(id: number): Promise<NotificationTemplate> {
    try {
      const response: AxiosResponse<NotificationTemplate> = await apiService.get(`/notification-templates/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to fetch notification template with ID ${id}`);
    }
  }

  /**
   * Create notification from template
   * @param templateId Template ID
   * @param userId User ID
   * @param variables Template variables
   * @returns Promise with created notification data
   */
  public async createNotificationFromTemplate(
    templateId: number,
    userId: number,
    variables: Record<string, string>
  ): Promise<Notification> {
    try {
      const response: AxiosResponse<Notification> = await apiService.post('/notifications/from-template', {
        templateId,
        userId,
        variables
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to create notification from template');
    }
  }

  /**
   * Subscribe to push notifications
   * @param subscription Push subscription object
   * @returns Promise with success status
   */
  public async subscribeToPushNotifications(subscription: PushSubscription): Promise<boolean> {
    try {
      await apiService.post('/notifications/push-subscription', subscription);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to subscribe to push notifications');
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns Promise with success status
   */
  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      await apiService.delete('/notifications/push-subscription');
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to unsubscribe from push notifications');
    }
  }

  /**
   * Get notification preferences
   * @returns Promise with notification preferences
   */
  public async getNotificationPreferences(): Promise<Record<string, boolean>> {
    try {
      const response: AxiosResponse<Record<string, boolean>> = await apiService.get('/notifications/preferences');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   * @param preferences Notification preferences
   * @returns Promise with updated notification preferences
   */
  public async updateNotificationPreferences(preferences: Record<string, boolean>): Promise<Record<string, boolean>> {
    try {
      const response: AxiosResponse<Record<string, boolean>> = await apiService.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, 'Failed to update notification preferences');
    }
  }

  /**
   * Bulk update notification templates (activate/deactivate)
   * @param ids Array of template IDs
   * @param action Action to perform ('activate' or 'deactivate')
   * @returns Promise with success status
   */
  public async bulkUpdateNotificationTemplates(
    ids: number[],
    action: 'activate' | 'deactivate'
  ): Promise<boolean> {
    try {
      await apiService.put('/notification-templates/bulk', { ids, action });
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to ${action} notification templates`);
    }
  }

  /**
   * Activate notification template
   * @param id Template ID
   * @returns Promise with updated template
   */
  public async activateNotificationTemplate(id: number): Promise<NotificationTemplate> {
    try {
      const response: AxiosResponse<NotificationTemplate> = await apiService.put(`/notification-templates/${id}/activate`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to activate notification template with ID ${id}`);
    }
  }

  /**
   * Deactivate notification template
   * @param id Template ID
   * @returns Promise with updated template
   */
  public async deactivateNotificationTemplate(id: number): Promise<NotificationTemplate> {
    try {
      const response: AxiosResponse<NotificationTemplate> = await apiService.put(`/notification-templates/${id}/deactivate`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to deactivate notification template with ID ${id}`);
    }
  }

  /**
   * Delete all notifications for a user
   * @param userId User ID
   * @returns Promise with success status
   */
  public async deleteAllNotificationsForUser(userId: number): Promise<boolean> {
    try {
      await apiService.delete(`/notifications/user/${userId}`);
      return true;
    } catch (error: unknown) {
      throw this.handleError(error, `Failed to delete all notifications for user with ID ${userId}`);
    }
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;
