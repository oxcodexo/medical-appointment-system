const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
// Get all doctors
router.get('/', doctorController.findAll);

// Get doctor by id
router.get('/:id', doctorController.findOne);

// Get doctors by specialty
router.get('/specialty/:specialtyId', doctorController.findBySpecialty);

// Get available time slots for a doctor on a specific date
router.get('/:doctorId/available-slots/:date', doctorController.getAvailableTimeSlots);

// Protected routes
router.use(authMiddleware.verifyToken);

// Create a new doctor (admin only)
router.post('/', authMiddleware.isAdmin, doctorController.create);

// Update a doctor (admin or doctor only)
router.put('/:id', authMiddleware.isResponsable, doctorController.update);

// Delete a doctor (admin only)
router.delete('/:id', authMiddleware.isAdmin, doctorController.delete);

// Get doctor by user id (user can only access their own doctor profile)
router.get('/user/:userId', (req, res, next) => {
  // Allow users to access their own doctor profile or admins to access any doctor profile
  if (req.userId == req.params.userId || req.userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'You can only access your own doctor profile!'
    });
  }
}, doctorController.findByUserId);

// Get doctor availability
router.get('/:doctorId/availability', doctorController.getAvailability);

// Get doctor absences
router.get('/:doctorId/absences', doctorController.getAbsences);

// Set doctor availability (doctor or admin only)
router.post('/:doctorId/availability', authMiddleware.isResponsable, doctorController.setAvailability);

// Remove doctor availability (doctor or admin only)
router.delete('/:doctorId/availability/:dayOfWeek', authMiddleware.isResponsable, doctorController.removeAvailability);

// Add doctor absence (doctor or admin only)
router.post('/:doctorId/absence', authMiddleware.isResponsable, doctorController.addAbsence);

// Remove doctor absence (doctor or admin only)
router.delete('/:doctorId/absence/:absenceId', authMiddleware.isResponsable, doctorController.removeAbsence);

module.exports = router;
