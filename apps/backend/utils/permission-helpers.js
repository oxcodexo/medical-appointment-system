const db = require('../models');
const logger = require('./logger');
const { NOTIFICATION, USER, DOCTOR, APPOINTMENT, SPECIALTY, MEDICAL_DOSSIER, PERMISSION } = require('@medical-appointment-system/shared-types');

/**
 * Permission helper functions and middleware factories for route authorization
 */
const permissionHelpers = {
  /**
   * Check if a user can access doctor appointments
   * @param {number} userId - The user ID
   * @param {number} doctorId - The doctor ID
   * @param {string} userRole - The user role
   * @returns {Promise<boolean>} - Whether the user has access
   */
  async canAccessDoctorAppointments(userId, doctorId, userRole) {
    try {
      // Admin and responsable roles have global access
      if (['admin', 'responsable'].includes(userRole)) {
        return true;
      }
      
      // Doctors can access their own appointments
      if (userRole === 'doctor') {
        const doctor = await db.doctor.findOne({ where: { userId } });
        if (doctor && doctor.id == doctorId) {
          return true;
        }
      }
      
      // Check if user is a manager for this doctor
      const doctorManager = await db.doctorManager.findOne({
        where: {
          doctorId,
          managerId: userId
        }
      });
      
      return !!doctorManager;
    } catch (error) {
      logger.error(`Error checking doctor appointment access: ${error.message}`, { userId, doctorId, userRole, error });
      return false;
    }
  },
  
  /**
   * Check if a user can access user appointments
   * @param {number} userId - The user ID
   * @param {number} targetUserId - The user ID whose appointments are being accessed
   * @param {string} userRole - The user role
   * @param {Array} permissions - The user permissions
   * @returns {boolean} - Whether the user has access
   */
  canAccessUserAppointments(userId, targetUserId, userRole, permissions) {
    try {
      // Users can access their own appointments
      if (userId === targetUserId) return true;
      
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, APPOINTMENT.VIEW_ALL);
    } catch (error) {
      logger.error(`Error checking appointment access: ${error.message}`, { userId, targetUserId, userRole, error });
      return false;
    }
  },
  
  /**
   * Check if a user can manage a doctor
   * @param {number} userId - The user ID
   * @param {number} doctorId - The doctor ID
   * @param {string} userRole - The user role
   * @returns {Promise<boolean>} - Whether the user can manage the doctor
   */
  async canManageDoctor(userId, doctorId, userRole) {
    try {
      // Admin role has global access
      if (userRole === 'admin') {
        return true;
      }
      
      // Responsable users need to be explicitly assigned as managers
      if (userRole === 'responsable') {
        const doctorManager = await db.doctorManager.findOne({
          where: {
            doctorId,
            managerId: userId
          }
        });
        
        return !!doctorManager;
      }
      
      return false;
    } catch (error) {
      logger.error(`Error checking doctor management access: ${error.message}`, { userId, doctorId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can access notifications for a specific user
   * @param {number} userId - The user ID making the request
   * @param {number} targetUserId - The user ID whose notifications are being accessed
   * @param {string} userRole - The user role
   * @param {Array} permissions - The user permissions
   * @returns {boolean} - Whether the user has access
   */
  canAccessUserNotifications(userId, targetUserId, userRole, permissions) {
    try {
      // Users can access their own notifications
      if (userId === targetUserId) return true;
      
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, NOTIFICATION.VIEW_ALL);
    } catch (error) {
      logger.error(`Error checking notification access: ${error.message}`, { userId, targetUserId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can manage notifications for a specific user
   * @param {number} userId - The user ID making the request
   * @param {number} targetUserId - The user ID whose notifications are being managed
   * @param {string} userRole - The user role
   * @param {Array} permissions - The user permissions
   * @returns {boolean} - Whether the user has access
   */
  canManageUserNotifications(userId, targetUserId, userRole, permissions) {
    try {
      // Users can manage their own notifications
      if (userId === targetUserId) return true;
      
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, NOTIFICATION.MANAGE_ALL);
    } catch (error) {
      logger.error(`Error checking notification management access: ${error.message}`, { userId, targetUserId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can manage specialties
   * @param {string} userRole - The user role
   * @param {Array} permissions - The user permissions
   * @param {string} action - The action being performed (create, update, delete)
   * @returns {boolean} - Whether the user has access
   */
  canManageSpecialty(userRole, permissions, action) {
    try {
      // Admin role has global access
      if (userRole === 'admin') {
        return true;
      }
      
      // Check for specific permissions
      const permissionKey = action.toUpperCase();
      return this.hasPermission(permissions, SPECIALTY[permissionKey]);
    } catch (error) {
      logger.error(`Error checking specialty management access: ${error.message}`, { userRole, action, error });
      return false;
    }
  },

  /**
   * Check if a user can view another user's data
   * @param {number} userId - The current user's ID
   * @param {number} targetUserId - The target user's ID
   * @param {string} userRole - The current user's role
   * @param {Array} permissions - The current user's permissions
   * @returns {boolean} - Whether the user has access
   */
  canViewUser(userId, targetUserId, userRole, permissions) {
    try {
      // Users can view their own data
      if (userId === targetUserId) return true;
      
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, USER.VIEW_ALL);
    } catch (error) {
      logger.error(`Error checking user view access: ${error.message}`, { userId, targetUserId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can update another user's data
   * @param {number} userId - The current user's ID
   * @param {number} targetUserId - The target user's ID
   * @param {string} userRole - The current user's role
   * @param {Array} permissions - The current user's permissions
   * @returns {boolean} - Whether the user has access
   */
  canUpdateUser(userId, targetUserId, userRole, permissions) {
    try {
      // Users can update their own data
      if (userId === targetUserId) return this.hasPermission(permissions, USER.UPDATE_OWN);
      
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, USER.UPDATE_ALL);
    } catch (error) {
      logger.error(`Error checking user update access: ${error.message}`, { userId, targetUserId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can manage permissions
   * @param {string} userRole - The current user's role
   * @param {Array} permissions - The current user's permissions
   * @returns {boolean} - Whether the user has access
   */
  canManagePermissions(userRole, permissions) {
    try {
      // Admin role has global access
      if (userRole === 'admin') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, PERMISSION.MANAGE);
    } catch (error) {
      logger.error(`Error checking permission management access: ${error.message}`, { userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can access a medical dossier
   * @param {number} userId - The current user's ID
   * @param {number} patientId - The patient's ID
   * @param {string} userRole - The current user's role
   * @param {Array} permissions - The current user's permissions
   * @returns {boolean} - Whether the user has access
   */
  async canAccessMedicalDossier(userId, patientId, userRole, permissions) {
    try {
      // Admin and responsable roles have global access
      if (['admin', 'responsable'].includes(userRole)) return true;
      
      // Patients can access their own medical dossier
      if (userRole === 'patient' && userId === patientId) return true;
      
      // Doctors can access medical dossiers of their patients
      if (userRole === 'doctor') {
        // Check if the doctor has any appointments with this patient
        const doctor = await db.doctor.findOne({ where: { userId } });
        if (!doctor) return false;
        
        const appointments = await db.appointment.findOne({
          where: {
            doctorId: doctor.id,
            patientId
          }
        });
        
        if (appointments) {
          return true;
        }
      }
      
      // Check for specific permissions
      return this.hasPermission(permissions, MEDICAL_DOSSIER.VIEW_ALL);
    } catch (error) {
      logger.error(`Error checking medical dossier access: ${error.message}`, { userId, patientId, userRole, error });
      return false;
    }
  },

  /**
   * Check if a user can manage a medical dossier
   * @param {string} userRole - The current user's role
   * @param {Array} permissions - The current user's permissions
   * @returns {boolean} - Whether the user has access
   */
  canManageMedicalDossier(userRole, permissions) {
    try {
      // Admin and responsable roles have global access
      if (['admin', 'responsable'].includes(userRole)) return true;
      
      // Doctors can manage medical dossiers
      if (userRole === 'doctor') return true;
      
      // Check for specific permissions
      return this.hasPermission(permissions, MEDICAL_DOSSIER.MANAGE);
    } catch (error) {
      logger.error(`Error checking medical dossier management access: ${error.message}`, { userRole, error });
      return false;
    }
  },

  /**
   * Check if a user has a specific permission
   * @param {Array|Object} permissions - The user's permissions
   * @param {string} permissionName - The permission to check for
   * @returns {boolean} - Whether the user has the permission
   */
  hasPermission(permissions, permissionName) { 
    // Handle case when permissions is null or undefined
    if (!permissions) return false;
    
    // Handle case when permissions is an object with 'all' property (from JWT token)
    if (permissions.all && Array.isArray(permissions.all)) {
      return permissions.all.some(p => p.name === permissionName);
    }
    
    // Handle case when permissions is an array of permission objects
    if (Array.isArray(permissions)) {
      return permissions.some(p => p.name === permissionName || p === permissionName);
    }
    
    // If permissions is in some other format, return false
    return false;
  },

  /**
   * Check if a user has any of the specified permissions
   * @param {Array} permissions - The user's permissions
   * @param {Array} permissionNames - The permissions to check for
   * @returns {boolean} - Whether the user has any of the permissions
   */
  hasAnyPermission(permissions, permissionNames) {
    return permissions?.some(p => permissionNames.includes(p.name));
  },

  /**
   * Middleware factory for checking doctor appointment access
   * @returns {Function} Express middleware
   */
  checkDoctorAppointmentAccess() {
    return async (req, res, next) => {
      try {
        const doctorId = req.params.doctorId;
        const hasAccess = await this.canAccessDoctorAppointments(
          req.userId,
          doctorId,
          req.userRole
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to view appointments for this doctor.'
        });
      } catch (err) {
        logger.error('Error in doctor appointment access middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking user appointment access
   * @returns {Function} Express middleware
   */
  checkUserAppointmentAccess() {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.userId;
        const hasAccess = this.canAccessUserAppointments(
          req.userId,
          targetUserId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to view this user\'s appointments.'
        });
      } catch (err) {
        logger.error('Error in user appointment access middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking doctor management access
   * @returns {Function} Express middleware
   */
  checkDoctorManagementAccess() {
    return async (req, res, next) => {
      try {
        const doctorId = req.params.doctorId || req.body.doctorId;
        const hasAccess = await this.canManageDoctor(
          req.userId,
          doctorId,
          req.userRole
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to manage this doctor.'
        });
      } catch (err) {
        logger.error('Error in doctor management middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking notification access for a user
   * @returns {Function} Express middleware
   */
  checkNotificationAccess() {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.userId;
        const hasAccess = this.canAccessUserNotifications(
          req.userId,
          targetUserId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to view notifications for this user.'
        });
      } catch (err) {
        logger.error('Error in notification access middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking notification management access for a user
   * @returns {Function} Express middleware
   */
  checkNotificationManagementAccess() {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.userId;
        const hasAccess = this.canManageUserNotifications(
          req.userId,
          targetUserId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to manage notifications for this user.'
        });
      } catch (err) {
        logger.error('Error in notification management middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking notification ownership or admin access
   * @returns {Function} Express middleware
   */
  checkNotificationOwnership() {
    return async (req, res, next) => {
      try {
        const notificationId = req.params.id;
        
        // Admin always has access
        if (req.userRole === 'admin') {
          return next();
        }
        
        // Find the notification to check ownership
        const notification = await db.notification.findByPk(notificationId);
        
        if (!notification) {
          return res.status(404).json({
            message: 'Notification not found.'
          });
        }
        
        // Check if user owns the notification
        if (notification.userId === req.userId) {
          return next();
        }
        
        // Check if user has manage_all permission
        if (this.hasPermission(req.permissions, NOTIFICATION.MANAGE_ALL)) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to access this notification.'
        });
      } catch (err) {
        logger.error('Error in notification ownership middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking specialty management permissions
   * @param {string} action - The action being performed (create, update, delete, view)
   * @returns {Function} Express middleware
   */
  checkSpecialtyPermission(action) {
    return (req, res, next) => {
      try {
        const hasAccess = this.canManageSpecialty(
          req.userRole,
          req.permissions,
          action
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: `You do not have permission to ${action} specialties.`
        });
      } catch (err) {
        logger.error(`Error in specialty ${action} middleware:`, err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking user view permissions
   * @returns {Function} Express middleware
   */
  checkUserViewAccess() {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.id || req.params.userId;
        const hasAccess = this.canViewUser(
          req.userId,
          targetUserId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to view this user.'
        });
      } catch (err) {
        logger.error('Error in user view middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking user update permissions
   * @returns {Function} Express middleware
   */
  checkUserUpdateAccess() {
    return (req, res, next) => {
      try {
        const targetUserId = req.params.id || req.params.userId;
        const hasAccess = this.canUpdateUser(
          req.userId,
          targetUserId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to update this user.'
        });
      } catch (err) {
        logger.error('Error in user update middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking permission management access
   * @returns {Function} Express middleware
   */
  checkPermissionManagementAccess() {
    return (req, res, next) => {
      try {
        const hasAccess = this.canManagePermissions(
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to manage user permissions.'
        });
      } catch (err) {
        logger.error('Error in permission management middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking medical dossier access
   * @returns {Function} Express middleware
   */
  checkMedicalDossierAccess() {
    return async (req, res, next) => {
      try {
        // Get the patient ID from the request
        let patientId;
        
        if (req.params.patientId) {
          patientId = req.params.patientId;
        } else if (req.params.id) {
          // If we have a dossier ID, we need to look up the patient ID
          const dossier = await db.medicalDossier.findByPk(req.params.id);
          if (!dossier) {
            return res.status(404).json({
              message: 'Medical dossier not found.'
            });
          }
          patientId = dossier.patientId;
        } else if (req.params.appointmentId) {
          // If we have an appointment ID, we need to look up the patient ID
          const appointment = await db.appointment.findByPk(req.params.appointmentId);
          if (!appointment) {
            return res.status(404).json({
              message: 'Appointment not found.'
            });
          }
          patientId = appointment.patientId;
        } else if (req.params.entryId) {
          // If we have a history entry ID, we need to look up the patient ID
          const entry = await db.medicalHistoryEntry.findByPk(req.params.entryId);
          if (!entry) {
            return res.status(404).json({
              message: 'Medical history entry not found.'
            });
          }
          const dossier = await db.medicalDossier.findByPk(entry.dossierId);
          if (!dossier) {
            return res.status(404).json({
              message: 'Medical dossier not found.'
            });
          }
          patientId = dossier.patientId;
        }
        
        if (!patientId) {
          logger.error('Unable to determine patient ID for medical dossier access check');
          return res.status(400).json({
            message: 'Unable to determine patient ID for access check.'
          });
        }
        
        const hasAccess = await this.canAccessMedicalDossier(
          req.userId,
          patientId,
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to access this medical dossier.'
        });
      } catch (err) {
        logger.error('Error in medical dossier access middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking medical dossier management access
   * @returns {Function} Express middleware
   */
  checkMedicalDossierManagementAccess() {
    return (req, res, next) => {
      try {
        const hasAccess = this.canManageMedicalDossier(
          req.userRole,
          req.permissions
        );
        
        if (hasAccess) {
          return next();
        }
        
        return res.status(403).json({
          message: 'You do not have permission to manage medical dossiers.'
        });
      } catch (err) {
        logger.error('Error in medical dossier management middleware:', err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking specific permission
   * @param {string} permissionName - The required permission
   * @returns {Function} Express middleware
   */
  requirePermission(permissionName) {
    return (req, res, next) => {
      try {
        // Admin always has all permissions
        if (req.userRole === 'admin') return next();

        if (this.hasPermission(req.permissions, permissionName)) return next();
        
        return res.status(403).json({
          message: `Requires permission: ${permissionName}`
        });
      } catch (err) {
        logger.error(`Error in permission middleware (${permissionName}):`, err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  },

  /**
   * Middleware factory for checking any of the specified permissions
   * @param {Array} permissionNames - The required permissions (any one is sufficient)
   * @returns {Function} Express middleware
   */
  requireAnyPermission(permissionNames) {
    return (req, res, next) => {
      try {
        // Admin always has all permissions
        if (req.userRole === 'admin') return next();

        if (this.hasAnyPermission(req.permissions, permissionNames)) return next();
        
        return res.status(403).json({
          message: `Requires one of these permissions: ${permissionNames.join(', ')}`
        });
      } catch (err) {
        logger.error(`Error in any-permission middleware (${permissionNames.join(',')}):`, err);
        return res.status(500).json({
          message: 'Error checking permissions',
          error: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
      }
    };
  }
};

module.exports = permissionHelpers;
