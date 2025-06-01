const validateRequest = {};

// Validate user creation
validateRequest.validateUserCreation = (req, res, next) => {
  // Required fields
  if (!req.body.name || !req.body.email || !req.body.password || !req.body.role) {
    return res.status(400).json({
      message: "Name, email, password, and role are required fields!"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({
      message: "Invalid email format!"
    });
  }

  // Validate password strength
  if (req.body.password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long!"
    });
  }

  // Validate role
  const validRoles = ['admin', 'doctor', 'patient', 'receptionist'];
  if (!validRoles.includes(req.body.role)) {
    return res.status(400).json({
      message: "Role must be one of: admin, doctor, patient, receptionist"
    });
  }

  next();
};

// Validate user update
validateRequest.validateUserUpdate = (req, res, next) => {
  // Validate email format if provided
  if (req.body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        message: "Invalid email format!"
      });
    }
  }

  // Validate role if provided
  if (req.body.role) {
    const validRoles = ['admin', 'doctor', 'patient', 'receptionist'];
    if (!validRoles.includes(req.body.role)) {
      return res.status(400).json({
        message: "Role must be one of: admin, doctor, patient, receptionist"
      });
    }
  }

  next();
};

// Validate user profile
validateRequest.validateUserProfile = (req, res, next) => {
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for profile update!"
    });
  }

  // Validate phone number if provided
  if (req.body.phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(req.body.phone)) {
      return res.status(400).json({
        message: "Invalid phone number format!"
      });
    }
  }

  next();
};

// Validate permission assignment
validateRequest.validatePermissionAssignment = (req, res, next) => {
  // Required fields
  if (!req.body.permissionId) {
    return res.status(400).json({
      message: "Permission ID is required!"
    });
  }

  // Validate expiration date if provided
  if (req.body.expiresAt) {
    const expiresAt = new Date(req.body.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }

    // Ensure expiration date is in the future
    if (expiresAt <= new Date()) {
      return res.status(400).json({
        message: "Expiration date must be in the future!"
      });
    }
  }

  next();
};

// Validate bulk user update
validateRequest.validateBulkUserUpdate = (req, res, next) => {
  // Required fields
  if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
    return res.status(400).json({
      message: "User IDs array is required!"
    });
  }

  if (!req.body.action) {
    return res.status(400).json({
      message: "Action is required!"
    });
  }

  // Validate action
  const validActions = ['activate', 'deactivate'];
  if (!validActions.includes(req.body.action)) {
    return res.status(400).json({
      message: "Action must be one of: activate, deactivate"
    });
  }

  next();
};

// Validate notification creation
validateRequest.validateNotificationCreation = (req, res, next) => {
  // Required fields
  if (!req.body.userId || !req.body.type || !req.body.title || !req.body.content) {
    return res.status(400).json({
      message: "User ID, type, title, and content are required fields!"
    });
  }

  // Validate priority if provided
  if (req.body.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (req.body.channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(req.body.channel)) {
      return res.status(400).json({
        message: "Channel must be one of: in-app, email, sms, push"
      });
    }
  }

  // Validate scheduled date if provided
  if (req.body.scheduledFor) {
    const scheduledFor = new Date(req.body.scheduledFor);
    if (isNaN(scheduledFor.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (req.body.expiresAt) {
    const expiresAt = new Date(req.body.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }
  }

  next();
};

// Validate notification from template
validateRequest.validateNotificationFromTemplate = (req, res, next) => {
  // Required fields
  if (!req.body.templateId || !req.body.userId) {
    return res.status(400).json({
      message: "Template ID and User ID are required fields!"
    });
  }

  // Validate variables if provided
  if (req.body.variables && typeof req.body.variables !== 'object') {
    return res.status(400).json({
      message: "Variables must be an object!"
    });
  }

  // Validate priority if provided
  if (req.body.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (req.body.channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(req.body.channel)) {
      return res.status(400).json({
        message: "Channel must be one of: in-app, email, sms, push"
      });
    }
  }

  // Validate scheduled date if provided
  if (req.body.scheduledFor) {
    const scheduledFor = new Date(req.body.scheduledFor);
    if (isNaN(scheduledFor.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (req.body.expiresAt) {
    const expiresAt = new Date(req.body.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }
  }

  next();
};

// Validate notification update
validateRequest.validateNotificationUpdate = (req, res, next) => {
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for notification update!"
    });
  }

  // Validate priority if provided
  if (req.body.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (req.body.channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(req.body.channel)) {
      return res.status(400).json({
        message: "Channel must be one of: in-app, email, sms, push"
      });
    }
  }

  // Validate delivery status if provided
  if (req.body.deliveryStatus) {
    const validStatuses = ['pending', 'sent', 'delivered', 'failed'];
    if (!validStatuses.includes(req.body.deliveryStatus)) {
      return res.status(400).json({
        message: "Delivery status must be one of: pending, sent, delivered, failed"
      });
    }
  }

  // Validate scheduled date if provided
  if (req.body.scheduledFor) {
    const scheduledFor = new Date(req.body.scheduledFor);
    if (isNaN(scheduledFor.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (req.body.expiresAt) {
    const expiresAt = new Date(req.body.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }
  }

  next();
};

// Validate notification template creation
validateRequest.validateNotificationTemplateCreation = (req, res, next) => {
  // Required fields
  if (!req.body.name || !req.body.subject || !req.body.content || !req.body.type) {
    return res.status(400).json({
      message: "Name, subject, content, and type are required fields!"
    });
  }

  // Validate variables if provided
  if (req.body.variables && !Array.isArray(req.body.variables)) {
    return res.status(400).json({
      message: "Variables must be an array!"
    });
  }

  // Validate channels if provided
  if (req.body.channels) {
    if (!Array.isArray(req.body.channels)) {
      return res.status(400).json({
        message: "Channels must be an array!"
      });
    }

    const validChannels = ['in-app', 'email', 'sms', 'push'];
    for (const channel of req.body.channels) {
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          message: "Channels must be one or more of: in-app, email, sms, push"
        });
      }
    }
  }

  // Validate default priority if provided
  if (req.body.defaultPriority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.defaultPriority)) {
      return res.status(400).json({
        message: "Default priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate default channel if provided
  if (req.body.defaultChannel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(req.body.defaultChannel)) {
      return res.status(400).json({
        message: "Default channel must be one of: in-app, email, sms, push"
      });
    }
  }

  next();
};

// Validate notification template update
validateRequest.validateNotificationTemplateUpdate = (req, res, next) => {
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for template update!"
    });
  }

  // Validate variables if provided
  if (req.body.variables && !Array.isArray(req.body.variables)) {
    return res.status(400).json({
      message: "Variables must be an array!"
    });
  }

  // Validate channels if provided
  if (req.body.channels) {
    if (!Array.isArray(req.body.channels)) {
      return res.status(400).json({
        message: "Channels must be an array!"
      });
    }

    const validChannels = ['in-app', 'email', 'sms', 'push'];
    for (const channel of req.body.channels) {
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          message: "Channels must be one or more of: in-app, email, sms, push"
        });
      }
    }
  }

  // Validate default priority if provided
  if (req.body.defaultPriority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(req.body.defaultPriority)) {
      return res.status(400).json({
        message: "Default priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate default channel if provided
  if (req.body.defaultChannel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(req.body.defaultChannel)) {
      return res.status(400).json({
        message: "Default channel must be one of: in-app, email, sms, push"
      });
    }
  }

  next();
};

// Validate bulk template update
validateRequest.validateBulkTemplateUpdate = (req, res, next) => {
  // Required fields
  if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
    return res.status(400).json({
      message: "Template IDs array is required!"
    });
  }

  if (!req.body.action) {
    return res.status(400).json({
      message: "Action is required!"
    });
  }

  // Validate action
  const validActions = ['activate', 'deactivate'];
  if (!validActions.includes(req.body.action)) {
    return res.status(400).json({
      message: "Action must be one of: activate, deactivate"
    });
  }

  next();
};

module.exports = validateRequest;
