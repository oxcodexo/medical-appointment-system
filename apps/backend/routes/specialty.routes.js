const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');
const { authJwt, loadPermissions } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const logger = require('../utils/logger');
const { SPECIALTY } = require('@medical-appointment-system/shared-types');

// Public routes - available to all users without authentication
// Get all specialties (with filtering and pagination)
router.get('/', specialtyController.findAll);

// Get specialty by id with doctor count
router.get('/:id', specialtyController.findOne);

// Protected routes - require authentication and permissions
router.use(authJwt.verifyToken);
router.use(loadPermissions);

// Get doctors by specialty
router.get('/:id/doctors', permissionHelpers.requirePermission(SPECIALTY.VIEW_ALL), specialtyController.getDoctors);

// Create a new specialty (permission-based)
router.post('/', permissionHelpers.requirePermission(SPECIALTY.CREATE), specialtyController.create);

// Update a specialty (permission-based)
router.put('/:id', permissionHelpers.requirePermission(SPECIALTY.UPDATE_ALL), specialtyController.update);

// Delete a specialty (permission-based)
// Use ?force=true query parameter to permanently delete instead of soft delete
router.delete('/:id', permissionHelpers.requirePermission(SPECIALTY.DELETE), specialtyController.delete);

// Bulk update specialties (activate/deactivate)
router.post('/bulk-update', permissionHelpers.requirePermission(SPECIALTY.UPDATE_ALL), specialtyController.bulkUpdate);

module.exports = router;
