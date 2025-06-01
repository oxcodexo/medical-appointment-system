const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authJwt, loadPermissions } = require('../middleware');
const permissionHelpers = require('../utils/permission-helpers');
const { DOCTOR } = require('@medical-appointment-system/shared-types');

// Public routes - information that patients need to book appointments
// Get all active doctors
router.get('/', doctorController.findAll);

// Get doctor by id (public profile)
router.get('/:id', doctorController.findOne);

// Get doctors by specialty
router.get('/specialty/:specialtyId', doctorController.findBySpecialty);

// Get available time slots for a doctor on a specific date
router.get('/:doctorId/available-slots/:date', doctorController.getAvailableTimeSlots);


// All routes require authentication
router.use(authJwt.verifyToken);

// Create a new doctor (admin only)
router.post('/', permissionHelpers.requirePermission(DOCTOR.CREATE), doctorController.create);

// Update a doctor (permission-based)
router.put('/:id', permissionHelpers.requirePermission(DOCTOR.UPDATE_OWN), doctorController.update);

// Delete a doctor (admin only)
router.delete('/:id', permissionHelpers.requirePermission(DOCTOR.DELETE), doctorController.delete);

// Get doctor by user id (permission-based)
router.get('/user/:userId', permissionHelpers.requirePermission(DOCTOR.VIEW_OWN), doctorController.findByUserId);

// Get doctors managed by a specific user (manager/responsable)
router.get('/managed-by/:userId', permissionHelpers.requirePermission(DOCTOR.VIEW_ALL), doctorController.findManagedByUser);

// Doctor availability management
// Get doctor availability
router.get('/:doctorId/availability', permissionHelpers.requirePermission(DOCTOR.VIEW_AVAILABILITY), doctorController.getAvailability);

// Get doctor absences
router.get('/:doctorId/absences', permissionHelpers.requirePermission(DOCTOR.VIEW_ABSENCES), doctorController.getAbsences);

// Set doctor availability (permission-based)
router.post('/:doctorId/availability', permissionHelpers.requirePermission(DOCTOR.MANAGE_AVAILABILITY), doctorController.setAvailability);

// Remove doctor availability (permission-based)
router.delete('/:doctorId/availability/:dayOfWeek', permissionHelpers.requirePermission(DOCTOR.MANAGE_AVAILABILITY), doctorController.removeAvailability);

// Add doctor absence (permission-based)
router.post('/:doctorId/absence', permissionHelpers.requirePermission(DOCTOR.MANAGE_ABSENCES), doctorController.addAbsence);

// Remove doctor absence (permission-based)
router.delete('/:doctorId/absence/:absenceId', permissionHelpers.requirePermission(DOCTOR.MANAGE_ABSENCES), doctorController.removeAbsence);

// Approve doctor absence (admin only)
router.put('/:doctorId/absence/:absenceId/approve', permissionHelpers.requirePermission(DOCTOR.APPROVE_ABSENCES), (req, res) => {
  req.body.status = 'approved';
  doctorController.updateAbsenceStatus(req, res);
});

// Reject doctor absence (admin only)
router.put('/:doctorId/absence/:absenceId/reject', permissionHelpers.requirePermission(DOCTOR.APPROVE_ABSENCES), (req, res) => {
  req.body.status = 'rejected';
  doctorController.updateAbsenceStatus(req, res);
});

// Get doctor statistics (appointments, patients, etc.)
router.get('/:doctorId/statistics', permissionHelpers.requirePermission(DOCTOR.VIEW_STATISTICS), (req, res) => {
  // This endpoint will be implemented in the statistics controller
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
