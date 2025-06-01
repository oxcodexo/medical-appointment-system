const db = require("../models");
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const User = db.user;
const { Op } = require("sequelize");

// Retrieve all Notifications with filtering and pagination
exports.findAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', type, status, priority, channel, startDate, endDate } = req.query;
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build filter condition
    const whereCondition = {};
    
    // Check if user has permission to view all notifications
    const hasViewAllPermission = req.permissions?.some(p => p.name === 'notification:view_all');
    
    // If user doesn't have permission to view all, restrict to their own notifications
    if (!hasViewAllPermission) {
      whereCondition.userId = req.userId;
    }
    
    // Apply filters if provided
    if (type) whereCondition.type = type;
    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;
    if (channel) whereCondition.channel = channel;
    
    // Date range filter
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereCondition.createdAt[Op.lte] = new Date(endDate);
    }
    
    // Find notifications with pagination
    const { count, rows } = await Notification.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Return response
    res.json({
      totalItems: count,
      notifications: rows,
      currentPage: parseInt(page),
      totalPages: totalPages
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notifications."
    });
  }
};

// Create and Save a new Notification
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.userId || !req.body.type || !req.body.title || !req.body.content) {
      return res.status(400).json({
        message: "User ID, type, title, and content are required fields!"
      });
    }

    // Create a Notification
    const notification = {
      userId: req.body.userId,
      type: req.body.type,
      title: req.body.title,
      content: req.body.content,
      isRead: req.body.isRead || false,
      readAt: req.body.readAt || null,
      priority: req.body.priority || 'normal',
      channel: req.body.channel || 'in-app',
      deliveryStatus: req.body.deliveryStatus || 'pending',
      scheduledFor: req.body.scheduledFor || null,
      expiresAt: req.body.expiresAt || null,
      templateId: req.body.templateId || null,
      relatedEntityType: req.body.relatedEntityType || null,
      relatedEntityId: req.body.relatedEntityId || null,
      actionUrl: req.body.actionUrl || null,
      metadata: req.body.metadata || null
    };

    // Save Notification in the database
    const data = await Notification.create(notification);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the Notification."
    });
  }
};

// Create a notification from a template
exports.createFromTemplate = async (req, res) => {
  try {
    // Validate request
    if (!req.body.templateId || !req.body.userId) {
      return res.status(400).json({
        message: "Template ID and User ID are required fields!"
      });
    }

    // Find template
    const template = await NotificationTemplate.findByPk(req.body.templateId);
    if (!template) {
      return res.status(404).json({
        message: `Template with ID ${req.body.templateId} not found!`
      });
    }

    // Find user
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      return res.status(404).json({
        message: `User with ID ${req.body.userId} not found!`
      });
    }

    // Process template with variables
    let content = template.content;
    let title = template.subject;
    const variables = req.body.variables || {};

    // Replace variables in content and title
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key]);
      title = title.replace(regex, variables[key]);
    });

    // Create notification
    const notification = {
      userId: req.body.userId,
      type: template.type,
      title: title,
      content: content,
      isRead: false,
      priority: req.body.priority || template.defaultPriority || 'normal',
      channel: req.body.channel || template.defaultChannel || 'in-app',
      deliveryStatus: 'pending',
      scheduledFor: req.body.scheduledFor || null,
      expiresAt: req.body.expiresAt || null,
      templateId: template.id,
      relatedEntityType: req.body.relatedEntityType || null,
      relatedEntityId: req.body.relatedEntityId || null,
      actionUrl: req.body.actionUrl || template.defaultActionUrl || null,
      metadata: req.body.metadata || null
    };

    // Save Notification in the database
    const data = await Notification.create(notification);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the Notification from template."
    });
  }
};

// Retrieve all Notifications for a user with filtering and pagination
exports.findAllForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - users can only see their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notifications.'
      });
    }

    // Get pagination and filter parameters
    const {
      page = 1,
      limit = 10,
      isRead,
      type,
      channel,
      priority,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereConditions = { userId };
    
    // Add isRead filter if provided
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add channel filter if provided
    if (channel) {
      whereConditions.channel = channel;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Add date range filters if provided
    if (startDate) {
      whereConditions.createdAt = { ...whereConditions.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      whereConditions.createdAt = { ...whereConditions.createdAt, [Op.lte]: new Date(endDate) };
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'type', 'isRead', 'priority', 'channel'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format notifications for response
    const formattedNotifications = notifications.map(notification => {
      const data = notification.toJSON();
      
      // Add formatted content with variables replaced
      if (data.template) {
        data.formattedTitle = replaceTemplateVariables(data.template.subject, data.variables || {});
        data.formattedContent = replaceTemplateVariables(data.template.content, data.variables || {});
      }
      
      return data;
    });

    res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error('Error retrieving notifications:', err);
    // Provide more detailed error information for debugging
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notifications.",
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      details: err.toString()
    });
  }
};

// Retrieve unread Notifications for a user with pagination
exports.findUnreadForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - users can only see their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notifications.'
      });
    }

    // Get pagination and filter parameters
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId,
      isRead: false
    };
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'type', 'priority'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get unread notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format notifications for response
    const formattedNotifications = notifications.map(notification => {
      const data = notification.toJSON();
      
      // Add formatted content with variables replaced
      if (data.template) {
        data.formattedTitle = replaceTemplateVariables(data.template.subject, data.variables || {});
        data.formattedContent = replaceTemplateVariables(data.template.content, data.variables || {});
      }
      
      return data;
    });

    res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error('Error retrieving unread notifications:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving unread notifications."
    });
  }
};

// Get unread notifications count for the current user
exports.getCurrentUserUnreadCount = async (req, res) => {
  try {
    // Get filter parameters
    const { type, priority, channel, detailed } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId: req.userId,
      isRead: false
    };
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Add channel filter if provided
    if (channel) {
      whereConditions.channel = channel;
    }

    // Get unread count
    const count = await Notification.count({
      where: whereConditions
    });
    
    // If detailed counts requested, get counts by type
    let countsByType = null;
    let countsByPriority = null;
    
    if (detailed === 'true') {
      // Get counts by type
      const typeResults = await Notification.findAll({
        attributes: [
          'type',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: whereConditions,
        group: ['type']
      });
      
      countsByType = {};
      typeResults.forEach(result => {
        countsByType[result.type] = parseInt(result.getDataValue('count'));
      });
      
      // Get counts by priority
      const priorityResults = await Notification.findAll({
        attributes: [
          'priority',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: whereConditions,
        group: ['priority']
      });
      
      countsByPriority = {};
      priorityResults.forEach(result => {
        countsByPriority[result.priority] = parseInt(result.getDataValue('count'));
      });
    }
    
    res.status(200).json({
      total: count,
      ...(countsByType && { byType: countsByType }),
      ...(countsByPriority && { byPriority: countsByPriority })
    });
  } catch (err) {
    console.error('Error getting unread notification count:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving unread notification count."
    });
  }
};

// Get unread notifications count for a user with type filtering
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check permissions - users can only see their own notification counts unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notification counts.'
      });
    }

    // Get filter parameters
    const { type, priority, channel } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId,
      isRead: false
    };
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Add channel filter if provided
    if (channel) {
      whereConditions.channel = channel;
    }

    // Get unread count
    const count = await Notification.count({
      where: whereConditions
    });
    
    // If detailed counts requested, get counts by type
    let countsByType = null;
    if (req.query.detailed === 'true') {
      const typeResults = await Notification.findAll({
        attributes: [
          'type',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: { 
          userId,
          isRead: false
        },
        group: ['type']
      });

      countsByType = typeResults.reduce((acc, result) => {
        acc[result.type] = parseInt(result.getDataValue('count'));
        return acc;
      }, {});
    }

    // If detailed counts requested, get counts by priority
    let countsByPriority = null;
    if (req.query.detailed === 'true') {
      const priorityResults = await Notification.findAll({
        attributes: [
          'priority',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: { 
          userId,
          isRead: false
        },
        group: ['priority']
      });

      countsByPriority = priorityResults.reduce((acc, result) => {
        acc[result.priority] = parseInt(result.getDataValue('count'));
        return acc;
      }, {});
    }
    
    res.status(200).json({ 
      count,
      ...(countsByType && { byType: countsByType }),
      ...(countsByPriority && { byPriority: countsByPriority })
    });
  } catch (err) {
    console.error('Error retrieving unread notifications count:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving unread notifications count."
    });
  }
};

// Find a single Notification with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const data = await Notification.findByPk(id);
    
    if (!data) {
      return res.status(404).json({
        message: `Notification with ID ${id} not found!`
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the notification."
    });
  }
};

// Mark a Notification as read
exports.markAsRead = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid notification ID format.'
      });
    }
    
    // Find the notification
    const notification = await Notification.findByPk(id, {
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });
    
    if (!notification) {
      return res.status(404).json({
        message: `Notification with ID ${id} not found!`
      });
    }
    
    // Check permissions - users can only mark their own notifications as read unless they have permission
    if (
      notification.userId !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to mark this notification as read.'
      });
    }

    // If notification is already read, return early
    if (notification.isRead) {
      return res.status(200).json({
        message: 'Notification is already marked as read.',
        notification
      });
    }
    
    // Update notification
    notification.isRead = true;
    notification.readAt = new Date();
    notification.updatedBy = req.userId;
    await notification.save();
    
    // Format notification for response
    const formattedNotification = notification.toJSON();
    
    // Add formatted content with variables replaced
    if (formattedNotification.template) {
      formattedNotification.formattedTitle = replaceTemplateVariables(
        formattedNotification.template.subject, 
        formattedNotification.variables || {}
      );
      formattedNotification.formattedContent = replaceTemplateVariables(
        formattedNotification.template.content, 
        formattedNotification.variables || {}
      );
    }
    
    res.status(200).json({
      message: 'Notification marked as read successfully.',
      notification: formattedNotification
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while marking the notification as read."
    });
  }
};

// Mark all Notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }
    
    // Check permissions - users can only mark their own notifications as read unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to mark all notifications as read for this user.'
      });
    }

    // Get filter parameters
    const { type, priority, channel } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId,
      isRead: false
    };
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Add channel filter if provided
    if (channel) {
      whereConditions.channel = channel;
    }
    
    // Update notifications
    const [updatedCount] = await Notification.update(
      { 
        isRead: true,
        readAt: new Date(),
        updatedBy: req.userId,
        updatedAt: new Date()
      },
      { 
        where: whereConditions
      }
    );
    
    res.status(200).json({
      message: `${updatedCount} notifications marked as read successfully.`,
      updatedCount
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while marking all notifications as read."
    });
  }
};

// Update a Notification
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid notification ID format.'
      });
    }
    
    // Find the notification
    const notification = await Notification.findByPk(id);
    
    if (!notification) {
      return res.status(404).json({
        message: `Notification with ID ${id} not found!`
      });
    }
    
    // Check permissions - users can only update their own notifications unless they have permission
    if (
      notification.userId !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to update this notification.'
      });
    }

    // Prepare update data
    const updateData = {};
    
    // Only allow certain fields to be updated
    const allowedFields = ['isRead', 'priority', 'channel', 'deliveryStatus', 'scheduledFor', 'expiresAt', 'actionUrl', 'metadata'];
    
    // Add fields that only admins can update
    if (req.userRole === 'admin' || req.permissions?.some(p => p.name === 'notification:manage_all')) {
      allowedFields.push('title', 'content', 'type');
    }
    
    // Filter allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // If marking as read, set readAt
    if (updateData.isRead === true && !notification.isRead) {
      updateData.readAt = new Date();
    }

    // Add audit information
    updateData.updatedBy = req.userId;
    updateData.updatedAt = new Date();

    // Update notification
    await notification.update(updateData);

    // Get updated notification with template
    const updatedNotification = await Notification.findByPk(id, {
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });
    
    // Format notification for response
    const formattedNotification = updatedNotification.toJSON();
    
    // Add formatted content with variables replaced
    if (formattedNotification.template) {
      formattedNotification.formattedTitle = replaceTemplateVariables(
        formattedNotification.template.subject, 
        formattedNotification.variables || {}
      );
      formattedNotification.formattedContent = replaceTemplateVariables(
        formattedNotification.template.content, 
        formattedNotification.variables || {}
      );
    }
    
    res.status(200).json({
      message: 'Notification was updated successfully.',
      notification: formattedNotification
    });
  } catch (err) {
    console.error('Error updating notification:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while updating the notification."
    });
  }
};

// Delete a Notification
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid notification ID format.'
      });
    }
    
    // Find the notification
    const notification = await Notification.findByPk(id);
    
    if (!notification) {
      return res.status(404).json({
        message: `Notification with ID ${id} not found!`
      });
    }
    
    // Check permissions - users can only delete their own notifications unless they have permission
    if (
      notification.userId !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to delete this notification.'
      });
    }

    // Delete notification
    await notification.destroy();
    
    res.status(200).json({
      message: 'Notification was deleted successfully!',
      id: id
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the notification."
    });
  }
};

// Delete all Notifications for a user
exports.deleteAllForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }
    
    // Check permissions - users can only delete their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to delete notifications for this user.'
      });
    }

    // Get filter parameters
    const { type, isRead, startDate, endDate } = req.query;

    // Build filter conditions
    const whereConditions = { userId };
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add isRead filter if provided
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Add date range filters if provided
    if (startDate) {
      whereConditions.createdAt = { ...whereConditions.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      whereConditions.createdAt = { ...whereConditions.createdAt, [Op.lte]: new Date(endDate) };
    }
    
    // Delete notifications with filters
    const num = await Notification.destroy({
      where: whereConditions
    });
    
    res.status(200).json({
      message: `${num} notifications were deleted successfully!`,
      count: num
    });
  } catch (err) {
    console.error('Error deleting all notifications:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while deleting notifications."
    });
  }
};

// Find notifications by type with pagination
exports.findByType = async (req, res) => {
  try {
    const userId = req.params.userId;
    const type = req.params.type;

    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }
    
    // Check permissions - users can only see their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notifications.'
      });
    }

    // Get pagination and filter parameters
    const {
      page = 1,
      limit = 10,
      isRead,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId,
      type
    };
    
    // Add isRead filter if provided
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'isRead', 'priority'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format notifications for response
    const formattedNotifications = notifications.map(notification => {
      const data = notification.toJSON();
      
      // Add formatted content with variables replaced
      if (data.template) {
        data.formattedTitle = replaceTemplateVariables(data.template.subject, data.variables || {});
        data.formattedContent = replaceTemplateVariables(data.template.content, data.variables || {});
      }
      
      return data;
    });

    res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error('Error retrieving notifications by type:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notifications by type."
    });
  }
};

// Find notifications by related entity with pagination
exports.findByRelatedEntity = async (req, res) => {
  try {
    const userId = req.params.userId;
    const entityType = req.params.entityType;
    const entityId = req.params.entityId;

    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }
    
    // Check permissions - users can only see their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notifications.'
      });
    }

    // Get pagination and filter parameters
    const {
      page = 1,
      limit = 10,
      isRead,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereConditions = { 
      userId,
      relatedEntityType: entityType,
      relatedEntityId: entityId
    };
    
    // Add isRead filter if provided
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }

    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Add priority filter if provided
    if (priority) {
      whereConditions.priority = priority;
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'type', 'isRead', 'priority'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'subject', 'content', 'type']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format notifications for response
    const formattedNotifications = notifications.map(notification => {
      const data = notification.toJSON();
      
      // Add formatted content with variables replaced
      if (data.template) {
        data.formattedTitle = replaceTemplateVariables(data.template.subject, data.variables || {});
        data.formattedContent = replaceTemplateVariables(data.template.content, data.variables || {});
      }
      
      return data;
    });

    res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error('Error retrieving notifications by related entity:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notifications by related entity."
    });
  }
};

// Helper function to replace template variables
function replaceTemplateVariables(template, variables) {
  if (!template || !variables) return template;
  
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value);
  }
  
  return result;
}
