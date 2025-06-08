const validateRequest = {};

// Validate user creation
validateRequest.validateUserCreation = (req, res, next) => {
  const { name, email, password, role } = req.body;
  console.log("validateUserCreationvalidateUserCreation",name, email, password, role);
  // Required fields
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Name, email, password, and role are required fields!"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format!"
    });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long!"
    });
  }

  // Validate role
  const validRoles = ['admin', 'doctor', 'patient', 'receptionist'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      message: "Role must be one of: admin, doctor, patient, receptionist"
    });
  }

  next();
};

// Validate user update
validateRequest.validateUserUpdate = (req, res, next) => {
  const { email, role } = req.body;
  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format!"
      });
    }
  }

  // Validate role if provided
  if (role) {
    const validRoles = ['admin', 'doctor', 'patient', 'receptionist'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Role must be one of: admin, doctor, patient, receptionist"
      });
    }
  }

  next();
};

// Validate user profile
validateRequest.validateUserProfile = (req, res, next) => {
  const { phone } = req.body;
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for profile update!"
    });
  }

  // Validate phone number if provided
  if (phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number format!"
      });
    }
  }

  next();
};

// Validate permission assignment
validateRequest.validatePermissionAssignment = (req, res, next) => {
  const { permissionId, expiresAt } = req.body;
  // Required fields
  if (!permissionId) {
    return res.status(400).json({
      message: "Permission ID is required!"
    });
  }

  // Validate expiration date if provided
  if (expiresAt) {
    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
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
  const { ids, action } = req.body;
  // Required fields
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "User IDs array is required!"
    });
  }

  if (!action) {
    return res.status(400).json({
      message: "Action is required!"
    });
  }

  // Validate action
  const validActions = ['activate', 'deactivate'];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      message: "Action must be one of: activate, deactivate"
    });
  }

  next();
};

// Validate notification creation
validateRequest.validateNotificationCreation = (req, res, next) => {
  const { userId, type, title, content, priority, channel, scheduledFor, expiresAt } = req.body;
  // Required fields
  if (!userId || !type || !title || !content) {
    return res.status(400).json({
      message: "User ID, type, title, and content are required fields!"
    });
  }

  // Validate priority if provided
  if (priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        message: "Channel must be one of: in-app, email, sms, push"
      });
    }
  }

  // Validate scheduled date if provided
  if (scheduledFor) {
    const scheduledForDate = new Date(scheduledFor);
    if (isNaN(scheduledForDate.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (expiresAt) {
    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }
  }

  next();
};

// Validate notification from template
validateRequest.validateNotificationFromTemplate = (req, res, next) => {
  const { templateId, userId, variables, priority, channel, scheduledFor, expiresAt } = req.body;
  // Required fields
  if (!templateId || !userId) {
    return res.status(400).json({
      message: "Template ID and User ID are required fields!"
    });
  }

  // Validate variables if provided
  if (variables && typeof variables !== 'object') {
    return res.status(400).json({
      message: "Variables must be an object!"
    });
  }

  // Validate priority if provided
  if (priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(channel)) {
      return res.status(400).json({
        message: "Channel must be one of: in-app, email, sms, push"
      });
    }
  }

  // Validate scheduled date if provided
  if (scheduledFor) {
    const scheduledForDate = new Date(scheduledFor);
    if (isNaN(scheduledForDate.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (expiresAt) {
    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
      return res.status(400).json({
        message: "Invalid expiration date format!"
      });
    }
  }

  next();
};

// Validate notification update
validateRequest.validateNotificationUpdate = (req, res, next) => {
  const { priority, channel, scheduledFor, expiresAt } = req.body;
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for notification update!"
    });
  }

  // Validate priority if provided
  if (priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate channel if provided
  if (channel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(channel)) {
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
  if (scheduledFor) {
    const scheduledForDate = new Date(scheduledFor);
    if (isNaN(scheduledForDate.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduled date format!"
      });
    }
  }

  // Validate expiration date if provided
  if (expiresAt) {
    const expiresAtDate = new Date(expiresAt);
    if (isNaN(expiresAtDate.getTime())) {
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
  if (defaultPriority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(defaultPriority)) {
      return res.status(400).json({
        message: "Default priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate default channel if provided
  if (defaultChannel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(defaultChannel)) {
      return res.status(400).json({
        message: "Default channel must be one of: in-app, email, sms, push"
      });
    }
  }

  next();
};

// Validate notification template update
validateRequest.validateNotificationTemplateUpdate = (req, res, next) => {
  const { variables, channels, defaultPriority, defaultChannel } = req.body;
  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "At least one field is required for template update!"
    });
  }

  // Validate variables if provided
  if (variables && !Array.isArray(variables)) {
    return res.status(400).json({
      message: "Variables must be an array!"
    });
  }

  // Validate channels if provided
  if (channels) {
    if (!Array.isArray(channels)) {
      return res.status(400).json({
        message: "Channels must be an array!"
      });
    }

    const validChannels = ['in-app', 'email', 'sms', 'push'];
    for (const channel of channels) {
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          message: "Channels must be one or more of: in-app, email, sms, push"
        });
      }
    }
  }

  // Validate default priority if provided
  if (defaultPriority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(defaultPriority)) {
      return res.status(400).json({
        message: "Default priority must be one of: low, normal, high, urgent"
      });
    }
  }

  // Validate default channel if provided
  if (defaultChannel) {
    const validChannels = ['in-app', 'email', 'sms', 'push'];
    if (!validChannels.includes(defaultChannel)) {
      return res.status(400).json({
        message: "Default channel must be one of: in-app, email, sms, push"
      });
    }
  }

  next();
};

// Validate bulk template update
validateRequest.validateBulkTemplateUpdate = (req, res, next) => {
  const { ids, action } = req.body;
  // Required fields
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      message: "Template IDs array is required!"
    });
  }

  if (!action) {
    return res.status(400).json({
      message: "Action is required!"
    });
  }

  // Validate action
  const validActions = ['activate', 'deactivate'];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      message: "Action must be one of: activate, deactivate"
    });
  }

  next();
};

module.exports = validateRequest;
