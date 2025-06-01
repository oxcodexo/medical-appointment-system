const db = require("../models");
const NotificationTemplate = db.notificationTemplate;
const { Op } = require("sequelize");

// Create and Save a new NotificationTemplate
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.subject || !req.body.content || !req.body.type) {
      return res.status(400).json({
        message: "Name, subject, content, and type are required fields!"
      });
    }

    // Create a NotificationTemplate
    const template = {
      name: req.body.name,
      description: req.body.description || "",
      subject: req.body.subject,
      content: req.body.content,
      type: req.body.type,
      variables: req.body.variables || [],
      channels: req.body.channels || ["in-app"],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      defaultPriority: req.body.defaultPriority || "normal",
      defaultChannel: req.body.defaultChannel || "in-app",
      defaultActionUrl: req.body.defaultActionUrl || null,
      category: req.body.category || "general"
    };

    // Save NotificationTemplate in the database
    const data = await NotificationTemplate.create(template);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the NotificationTemplate."
    });
  }
};

// Retrieve all NotificationTemplates with filtering and pagination
exports.findAll = async (req, res) => {
  try {
    // Check permissions - only users with appropriate permissions can view templates
    if (
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => ['notification_template:view', 'notification:manage_all'].includes(p.name))
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view notification templates.'
      });
    }

    // Get pagination and filter parameters
    const {
      page = 1,
      limit = 10,
      type,
      category,
      isActive,
      name,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }
    
    // Add category filter if provided
    if (category) {
      whereConditions.category = category;
    }
    
    // Add isActive filter if provided
    if (isActive !== undefined) {
      whereConditions.isActive = isActive === 'true';
    }

    // Add name filter if provided
    if (name) {
      whereConditions.name = { [Op.like]: `%${name}%` };
    }

    // Validate sort parameters
    const validSortFields = ['name', 'type', 'category', 'createdAt', 'isActive'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get templates with pagination
    const { count, rows: templates } = await NotificationTemplate.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      attributes: {
        exclude: ['content'] // Exclude content to reduce payload size
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      templates,
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
    console.error('Error retrieving notification templates:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notification templates."
    });
  }
};

// Find a single NotificationTemplate with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid template ID format.'
      });
    }
    
    // Check permissions - only users with appropriate permissions can view templates
    if (
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => ['notification_template:view', 'notification:manage_all'].includes(p.name))
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view notification templates.'
      });
    }
    
    const template = await NotificationTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        message: `NotificationTemplate with ID ${id} not found!`
      });
    }

    // Get usage statistics if requested
    let usageStats = null;
    if (req.query.includeStats === 'true') {
      // Count notifications using this template
      const notificationCount = await db.notification.count({
        where: { templateId: id }
      });

      // Get notification delivery status counts
      const deliveryStats = await db.notification.findAll({
        attributes: [
          'deliveryStatus',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: { templateId: id },
        group: ['deliveryStatus']
      });

      // Format delivery stats
      const formattedDeliveryStats = deliveryStats.reduce((acc, stat) => {
        acc[stat.deliveryStatus] = parseInt(stat.getDataValue('count'));
        return acc;
      }, {});

      usageStats = {
        totalUsageCount: notificationCount,
        deliveryStatusCounts: formattedDeliveryStats
      };
    }
    
    res.status(200).json({
      template,
      ...(usageStats && { usageStats })
    });
  } catch (err) {
    console.error('Error retrieving notification template:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the notification template."
    });
  }
};

// Find NotificationTemplates by type
exports.findByType = async (req, res) => {
  try {
    const type = req.params.type;
    
    const data = await NotificationTemplate.findAll({
      where: { 
        type: type,
        isActive: true
      },
      order: [['name', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notification templates by type."
    });
  }
};

// Find NotificationTemplates by category
exports.findByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    const data = await NotificationTemplate.findAll({
      where: { 
        category: category,
        isActive: true
      },
      order: [['name', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving notification templates by category."
    });
  }
};

// Update a NotificationTemplate
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await NotificationTemplate.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "NotificationTemplate was updated successfully."
      });
    } else {
      res.status(404).json({
        message: `Cannot update NotificationTemplate with ID ${id}. Maybe NotificationTemplate was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while updating the notification template."
    });
  }
};

// Delete a NotificationTemplate
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await NotificationTemplate.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "NotificationTemplate was deleted successfully!"
      });
    } else {
      res.status(404).json({
        message: `Cannot delete NotificationTemplate with ID ${id}. Maybe NotificationTemplate was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the notification template."
    });
  }
};

// Activate a NotificationTemplate
exports.activate = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid template ID format.'
      });
    }
    
    const template = await NotificationTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        message: `NotificationTemplate with ID ${id} not found!`
      });
    }
    
    // If template is already active, return early
    if (template.isActive) {
      return res.status(200).json({
        message: 'NotificationTemplate is already active.',
        template: {
          id: template.id,
          name: template.name,
          isActive: template.isActive
        }
      });
    }
    
    template.isActive = true;
    template.updatedBy = req.userId;
    template.updatedAt = new Date();
    await template.save();
    
    res.status(200).json({
      message: "NotificationTemplate was activated successfully.",
      template: {
        id: template.id,
        name: template.name,
        isActive: template.isActive
      }
    });
  } catch (err) {
    console.error('Error activating notification template:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while activating the notification template."
    });
  }
};

// Deactivate a NotificationTemplate
exports.deactivate = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid template ID format.'
      });
    }
    
    const template = await NotificationTemplate.findByPk(id);
    
    if (!template) {
      return res.status(404).json({
        message: `NotificationTemplate with ID ${id} not found!`
      });
    }
    
    template.isActive = false;
    template.updatedBy = req.userId;
    template.updatedAt = new Date();
    await template.save();
    
    res.status(200).json({
      message: "NotificationTemplate was deactivated successfully."
    });
  } catch (err) {
    console.error('Error deactivating notification template:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while deactivating the notification template."
    });
  }
};

// Bulk update NotificationTemplates (activate/deactivate)
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, action } = req.body;

    // Validate inputs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: 'Template IDs array is required.'
      });
    }

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be either "activate" or "deactivate".'
      });
    }

    // Prepare update data
    const updateData = {
      isActive: action === 'activate',
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Update templates
    const [updatedCount] = await NotificationTemplate.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    // Get updated templates
    const updatedTemplates = await NotificationTemplate.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'name', 'isActive']
    });

    res.status(200).json({
      message: `${updatedCount} templates ${action === 'activate' ? 'activated' : 'deactivated'} successfully.`,
      updatedCount,
      templates: updatedTemplates
    });
  } catch (err) {
    console.error('Error performing bulk update on templates:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while updating templates.'
    });
  }
};
