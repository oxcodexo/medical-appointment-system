const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authJwt, loadPermissions } = require('../middleware');

// Public routes
// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication and permissions)
// Apply authentication and permissions middleware to all routes below
router.use(authJwt.verifyToken);
router.use(loadPermissions);

// Get current user profile
router.get('/profile', authController.profile);

// Change password (requires authentication)
router.post('/change-password', authController.changePassword);

// Get user permissions
router.get('/permissions', (req, res) => {
  // The permissions are already included in the profile response
  // This route is just for convenience
  res.redirect('/api/auth/profile');
});

module.exports = router;
