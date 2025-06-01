const db = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware to load user permissions into the request object
 * This should be used after authJwt.verifyToken and before any permission checks
 */
const loadPermissions = async (req, res, next) => {
  try {
    // Skip if no user ID (should not happen after verifyToken)
    if (!req.userId) {
      logger.warn('loadPermissions called without userId in request');
      return next();
    }

    // Admin role has all permissions by default
    if (req.userRole === 'admin') {
      // We don't need to load specific permissions for admin
      req.permissions = ['*']; // Special wildcard permission
      return next();
    }

    // Get user permissions from database
    const userPermissions = await db.userPermission.findAll({
      where: { 
        userId: req.userId,
        isGranted: true
      },
      include: [{
        model: db.permission,
        attributes: ['name']
      }]
    });
    
    // Store permissions in request object
    req.permissions = userPermissions.map(up => up.permission?.name).filter(Boolean);
    logger.info(`Loaded ${req.permissions.length} permissions for user ${req.userId}`);
    
    next();
  } catch (error) {
    logger.error(`Error loading permissions: ${error.message}`, { userId: req.userId, error });
    // Don't fail the request if permissions can't be loaded
    req.permissions = [];
    next();
  }
};

module.exports = loadPermissions;
