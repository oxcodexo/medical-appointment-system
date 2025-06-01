const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authJwt } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const { APPOINTMENT } = require('@medical-appointment-system/shared-types');

// All routes require authentication
router.use(authJwt.verifyToken);

// Get all appointments
// Permission-based: Users see their own, doctors see their appointments, admins see all
router.get('/', permissionHelpers.requirePermission(APPOINTMENT.VIEW_ALL),appointmentController.findAll);

// Create a new appointment
// Anyone authenticated can create an appointment
router.post('/', permissionHelpers.requirePermission(APPOINTMENT.CREATE), appointmentController.create);

// Get appointment by id
// Permission check is handled in the controller
router.get('/:id', permissionHelpers.requirePermission(APPOINTMENT.VIEW_OWN), appointmentController.findOne);

// Update appointment status
// Permission check is handled in the controller
router.put('/:id/status', permissionHelpers.requirePermission(APPOINTMENT.UPDATE_OWN), appointmentController.updateStatus);

// Update appointment details
// Admin only
router.put('/:id', permissionHelpers.requirePermission(APPOINTMENT.UPDATE_ALL), appointmentController.update);

// Delete appointment
// Admin only
router.delete('/:id', permissionHelpers.requirePermission(APPOINTMENT.DELETE), appointmentController.delete);

// Get appointments for doctor
// Allow doctor managers to access appointments for doctors they manage
router.get('/doctor/:doctorId', permissionHelpers.requirePermission(APPOINTMENT.VIEW_OWN), appointmentController.findByDoctor);

// Get appointments for user
// Permission check is handled in the controller
router.get('/user/:userId', permissionHelpers.requirePermission(APPOINTMENT.VIEW_OWN), appointmentController.findByUser);

// Cancel appointment
// Permission check is handled in the controller
router.put('/:id/cancel', permissionHelpers.requirePermission(APPOINTMENT.UPDATE_OWN), appointmentController.cancel);

// Restore canceled appointment
// Permission check is handled in the controller
router.put('/:id/restore', permissionHelpers.requirePermission(APPOINTMENT.UPDATE_OWN), appointmentController.restore);

// Get upcoming appointments for the authenticated user
router.get('/upcoming', permissionHelpers.requirePermission(APPOINTMENT.VIEW_OWN), (req, res) => {
  req.query.userId = req.userId;
  req.query.status = 'confirmed';
  req.query.startDate = new Date().toISOString();
  appointmentController.findAll(req, res);
});

// Get past appointments for the authenticated user
router.get('/history', permissionHelpers.requirePermission(APPOINTMENT.VIEW_OWN), (req, res) => {
  req.query.userId = req.userId;
  req.query.endDate = new Date().toISOString();
  appointmentController.findAll(req, res);
});

module.exports = router;
