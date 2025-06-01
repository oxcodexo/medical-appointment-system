const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authJwt, validateRequest, loadPermissions } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const logger = require('../utils/logger');
const { USER, NOTIFICATION, PERMISSION } = require('@medical-appointment-system/shared-types');

// Apply authentication and permissions middleware to all routes
// Temporarily commented out for development
// router.use(authJwt.verifyToken);

// Create a new User (admin only)
router.post("/", [
  permissionHelpers.requirePermission(USER.CREATE),
  validateRequest.validateUserCreation
], userController.create);

// Retrieve all Users (with filtering and pagination)
// router.get("/", permissionHelpers.requireAnyPermission([USER.VIEW_ALL, USER.VIEW_OWN]), userController.findAll);
router.get("/", userController.findAll);

// Retrieve a single User with id
router.get("/:id", permissionHelpers.checkUserViewAccess(), userController.findOne);

// Update a User with id
router.put("/:id", [
  permissionHelpers.checkUserUpdateAccess(),
  validateRequest.validateUserUpdate
], userController.update);

// Delete a User with id (admin only)
router.delete("/:id", permissionHelpers.requirePermission(USER.DELETE), userController.delete);

// Get user profile
router.get("/:userId/profile", userController.getUserProfile);

// Create or update user profile
router.post("/:userId/profile", [
  permissionHelpers.checkUserUpdateAccess(),
  validateRequest.validateUserProfile
], userController.updateUserProfile);

// Get user permissions
router.get("/:userId/permissions", permissionHelpers.checkUserViewAccess(), userController.getUserPermissions);

// Add permission to user (admin only)
router.post("/:userId/permissions", [
  permissionHelpers.checkPermissionManagementAccess(),
  validateRequest.validatePermissionAssignment
], userController.addUserPermission);

// Remove permission from user (admin only)
router.delete("/:userId/permissions/:permissionId", permissionHelpers.checkPermissionManagementAccess(), userController.removeUserPermission);

// Bulk update users (activate/deactivate) (admin only)
router.post("/bulk-update", [
  permissionHelpers.requirePermission('user:update_all'),
  validateRequest.validateBulkUserUpdate
], userController.bulkUpdate);

// Get user notifications
router.get("/:userId/notifications", permissionHelpers.checkNotificationAccess(), userController.getUserNotifications);

// Mark notification as read
router.put("/:userId/notifications/:notificationId/read", permissionHelpers.checkNotificationManagementAccess(), userController.markNotificationAsRead);

// Mark all notifications as read
router.put("/:userId/notifications/read-all", permissionHelpers.checkNotificationManagementAccess(), userController.markAllNotificationsAsRead);

// Delete notification
router.delete("/:userId/notifications/:notificationId", permissionHelpers.checkNotificationManagementAccess(), userController.deleteNotification);

module.exports = router;
