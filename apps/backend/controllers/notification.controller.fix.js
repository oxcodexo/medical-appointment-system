const db = require("../models");
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const User = db.user;
const { Op } = require("sequelize");

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
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: NotificationTemplate,
          as: 'template',
          attributes: ['id', 'name', 'subject', 'content', 'type']
        }
      ]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format response
    res.status(200).json({
      items: notifications,
      metadata: {
        totalItems: count,
        totalPages,
        currentPage,
        itemsPerPage: parsedLimit,
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
