const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
// Create a new appointment (anyone can book an appointment)
router.post('/', appointmentController.create);

// Protected routes
router.use(authMiddleware.verifyToken);

// Get all appointments (admin only)
router.get('/', authMiddleware.isAdmin, appointmentController.findAll);

// Get appointment by id
router.get('/:id', appointmentController.findOne);

// Update appointment status (doctor or admin only)
router.put('/:id/status', authMiddleware.isResponsable, appointmentController.updateStatus);

// Update appointment (admin only)
router.put('/:id', authMiddleware.isAdmin, appointmentController.update);

// Delete appointment (admin only)
router.delete('/:id', authMiddleware.isAdmin, appointmentController.delete);

// Get appointments for doctor (doctor or admin only)
router.get('/doctor/:doctorId', authMiddleware.isResponsable, appointmentController.findByDoctor);

// Get appointments for user (user can only access their own appointments)
router.get('/user/:userId', (req, res, next) => {
  // Allow users to access their own appointments or admins to access any user's appointments
  if (req.userId == req.params.userId || req.userRole === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: 'You can only access your own appointments!'
    });
  }
}, appointmentController.findByUser);

// Cancel appointment
router.put('/:id/cancel', appointmentController.cancel);

module.exports = router;
