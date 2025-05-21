const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
// Get all specialties
router.get('/', specialtyController.findAll);

// Get specialty by id
router.get('/:id', specialtyController.findOne);

// Protected routes
router.use(authMiddleware.verifyToken);

// Create a new specialty (admin only)
router.post('/', authMiddleware.isAdmin, specialtyController.create);

// Update a specialty (admin only)
router.put('/:id', authMiddleware.isAdmin, specialtyController.update);

// Delete a specialty (admin only)
router.delete('/:id', authMiddleware.isAdmin, specialtyController.delete);

module.exports = router;
