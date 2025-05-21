const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);

// Get all users (admin only)
router.get('/', authMiddleware.isAdmin, userController.findAll);

// Get user by id
router.get('/:id', userController.findOne);

// Update user
router.put('/:id', userController.update);

// Delete user (admin only)
router.delete('/:id', authMiddleware.isAdmin, userController.delete);

// Get user profile
router.get('/:userId/profile', userController.getUserProfile);

// Update user profile
router.put('/:userId/profile', userController.updateUserProfile);

module.exports = router;
