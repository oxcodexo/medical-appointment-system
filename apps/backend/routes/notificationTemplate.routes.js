const express = require('express');
const router = express.Router();
const notificationTemplateController = require('../controllers/notificationTemplate.controller');
const { authJwt, validateRequest, loadPermissions } = require('../middleware');

// Apply authentication and permissions middleware to all routes
router.use(authJwt.verifyToken);
router.use(loadPermissions);

// Create a new NotificationTemplate
router.post("/", [
  authJwt.hasPermission('notification_template:create'),
  validateRequest.validateNotificationTemplateCreation
], notificationTemplateController.create);

// Retrieve all NotificationTemplates with filtering
router.get("/", [
  authJwt.hasAnyPermission(['notification_template:view', 'notification:manage_all'])
], notificationTemplateController.findAll);

// Retrieve NotificationTemplates by type
router.get("/type/:type", [
  authJwt.hasAnyPermission(['notification_template:view', 'notification:manage_all'])
], notificationTemplateController.findByType);

// Retrieve NotificationTemplates by category
router.get("/category/:category", [
  authJwt.hasAnyPermission(['notification_template:view', 'notification:manage_all'])
], notificationTemplateController.findByCategory);

// Retrieve a single NotificationTemplate with id
router.get("/:id", [
  authJwt.hasAnyPermission(['notification_template:view', 'notification:manage_all'])
], notificationTemplateController.findOne);

// Update a NotificationTemplate with id
router.put("/:id", [
  authJwt.hasPermission('notification_template:update'),
  validateRequest.validateNotificationTemplateUpdate
], notificationTemplateController.update);

// Delete a NotificationTemplate with id
router.delete("/:id", [
  authJwt.hasPermission('notification_template:delete')
], notificationTemplateController.delete);

// Activate a NotificationTemplate
router.put("/:id/activate", [
  authJwt.hasPermission('notification_template:update')
], notificationTemplateController.activate);

// Deactivate a NotificationTemplate
router.put("/:id/deactivate", [
  authJwt.hasPermission('notification_template:update')
], notificationTemplateController.deactivate);

// Bulk activate/deactivate NotificationTemplates
router.post("/bulk-update", [
  authJwt.hasPermission('notification_template:update'),
  validateRequest.validateBulkTemplateUpdate
], notificationTemplateController.bulkUpdate);

module.exports = router;
