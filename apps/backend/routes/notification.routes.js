const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authJwt, validateRequest, loadPermissions } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const logger = require('../utils/logger');
const { NOTIFICATION, USER } = require('@medical-appointment-system/shared-types');

// Apply authentication and permissions middleware to all routes
router.use(authJwt.verifyToken);
router.use(loadPermissions);

// Retrieve all Notifications with filtering and pagination
router.get("/", permissionHelpers.requireAnyPermission([NOTIFICATION.VIEW_ALL, USER.VIEW_OWN]), notificationController.findAll);

// Create a new Notification
router.post("/", [
  permissionHelpers.requireAnyPermission([NOTIFICATION.CREATE, NOTIFICATION.MANAGE_ALL]),
  validateRequest.validateNotificationCreation
], notificationController.create);

// Create a notification from a template
router.post("/from-template", [
  permissionHelpers.requireAnyPermission([NOTIFICATION.CREATE, NOTIFICATION.MANAGE_ALL]),
  validateRequest.validateNotificationFromTemplate
], notificationController.createFromTemplate);

// Retrieve all Notifications for a user with filtering and pagination
router.get("/user/:userId", permissionHelpers.checkNotificationAccess(), notificationController.findAllForUser);

// Retrieve unread Notifications for a user with filtering and pagination
router.get("/user/:userId/unread", permissionHelpers.checkNotificationAccess(), notificationController.findUnreadForUser);

// Get unread notifications count for a user with filtering
router.get("/user/:userId/unread-count", permissionHelpers.checkNotificationAccess(), notificationController.getUnreadCount);

// Get unread notifications count for the current user
router.get("/unread-count", permissionHelpers.requireAnyPermission([NOTIFICATION.VIEW_ALL, USER.VIEW_OWN]), notificationController.getCurrentUserUnreadCount);

// Retrieve a single Notification with id
router.get("/:id", permissionHelpers.checkNotificationOwnership(), notificationController.findOne);

// Mark a Notification as read
router.put("/:id/read", permissionHelpers.checkNotificationOwnership(), notificationController.markAsRead);

// Mark all Notifications as read for a user
router.put("/user/:userId/read-all", permissionHelpers.checkNotificationManagementAccess(), notificationController.markAllAsRead);

// Update a Notification with id
router.put("/:id", [
  permissionHelpers.checkNotificationOwnership(),
  validateRequest.validateNotificationUpdate
], notificationController.update);

// Delete a Notification with id
router.delete("/:id", permissionHelpers.checkNotificationOwnership(), notificationController.delete);

// Delete all Notifications for a user
router.delete("/user/:userId", permissionHelpers.checkNotificationManagementAccess(), notificationController.deleteAllForUser);

// Find notifications by type with filtering and pagination
router.get("/user/:userId/type/:type", permissionHelpers.checkNotificationAccess(), notificationController.findByType);

// Find notifications by related entity with filtering and pagination
router.get("/user/:userId/entity/:entityType/:entityId", permissionHelpers.checkNotificationAccess(), notificationController.findByRelatedEntity);

module.exports = router;
