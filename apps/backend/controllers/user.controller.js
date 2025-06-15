const { ROLE_PERMISSION_MAP } = require('@medical-appointment-system/shared-types');
const db = require('../models');
const User = db.user;
const UserProfile = db.userProfile;
const Doctor = db.doctor;
const Appointment = db.appointment;
const UserPermission = db.userPermission;
const Permission = db.permission;
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const { Op } = db.Sequelize;
const bcrypt = require('bcryptjs'); 

// Create a new user
exports.create = async (req, res) => {
  const { name, email, password, role, phone, address, dateOfBirth, gender, bio, experience, yearsOfExperience, languages, officeAddress, officeHours, acceptingNewPatients, specialtyId } = req.body;
  try {

    // Check if user with email already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser)
      return res.status(400).json({
        message: "Email is already in use!"
      });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const user = {
      name,
      email,
      password: hashedPassword,
      role,
      status: true,
      emailVerified: true,
      phone,
      address,
      createdBy: req.userId
    };

    // Save user in the database
    const data = await User.create(user);
    
    // Create default profile
    if (data) {
    // Assign permissions based on role 
    if (role && Object.keys(ROLE_PERMISSION_MAP).includes(role)) {
      let permissionsToAssign = ROLE_PERMISSION_MAP[role];
      if (role === 'admin') {
        // Assign all permissions to admin
        const allPermissions = await Permission.findAll();
        permissionsToAssign = allPermissions.map(p => p.name);
      }
      // Map permission names to IDs
      const permissionRecords = await Permission.findAll({ where: { name: permissionsToAssign } });
      const userPermissions = permissionRecords.map(p => ({
        userId: data.id,
        permissionId: p.id,
        isGranted: true
      }));

      if (userPermissions.length > 0) 
        await UserPermission.bulkCreate(userPermissions);
    }

     // await UserProfile.create({
      //   userId: data.id,
      //   phoneNumber: phone || null,
      //   address: address || null,
      //   dateOfBirth: dateOfBirth || null,
      //   gender: gender || null
      // });

      // // Add default permissions based on role
      // if (data.role === 'patient') {
      //   // Get patient permissions
      //   const patientPermissions = await Permission.findAll({
      //     where: {
      //       name: {
      //         [Op.like]: '%:view_own%'
      //       }
      //     }
      //   });

      //   // Assign permissions to user
      //   for (const permission of patientPermissions) {
      //     await UserPermission.create({
      //       userId: data.id,
      //       permissionId: permission.id,
      //       isActive: true,
      //       createdBy: req.userId
      //     });
      //   }
      // }

      // Send welcome notification
      // await sendUserNotification(data.id, 'welcome', { adminName: req.user?.name || 'Administrator' });
    }

    if (role === 'doctor') {
      await Doctor.create({
        userId: data.id,
        specialtyId,
        bio,
        experience,
        yearsOfExperience,
        languages: Array.isArray(languages) ? languages.join(',') : '',
        officeAddress,
        officeHours,
        acceptingNewPatients
      });
    }

    // Return success response with user data (excluding password)
    const { password:pwd, ...userWithoutPassword } = data.toJSON();
    return res.status(201).json({
      message: "User created successfully!",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the user."
    });
  }
};

// Helper function to send user-related notifications
async function sendUserNotification(userId, type, metadata = {}) {
  try {
    // Get user details
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email']
    });

    if (!user) return;

    // Find notification template
    const templateName = `user_${type}`;
    const template = await NotificationTemplate.findOne({
      where: { name: templateName, isActive: true }
    });

    if (!template) return;

    // Create variables for template
    const variables = {
      userName: user.name,
      userEmail: user.email,
      date: new Date().toLocaleDateString(),
      ...metadata
    };

    // Replace variables in template
    let content = template.content;
    let title = template.subject;

    // Replace all variables in content and title
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, variables[key]);
      title = title.replace(regex, variables[key]);
    });

    // Create notification
    await Notification.create({
      userId,
      type: `user_${type}`,
      title,
      content,
      isRead: false,
      priority: type === 'account_deactivated' ? 'high' : 'normal',
      channel: 'in-app',
      deliveryStatus: 'delivered',
      templateId: template.id,
      metadata: { ...metadata }
    });

    return true;
  } catch (error) {
    console.error('Error sending user notification:', error);
    return false;
  }
}

// Get all users
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving users.'
    });
  }
};

// Get user by id with detailed information
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - users can only see their own data unless they have permission
    if (
      parseInt(id) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'user:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user profile.'
      });
    }

    // Get user with profile
    const user = await User.findByPk(id, {
      attributes: { 
        exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires', 'verificationTokenExpires'] 
      },
      include: [UserProfile]
    });
    
    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} was not found.`
      });
    }

    // Get additional information based on user role
    let additionalInfo = {};

    // If user is a doctor, get doctor information
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({
        where: { userId: id },
        include: [{ model: db.specialty, attributes: ['id', 'name'] }]
      });

      if (doctor) {
        additionalInfo.doctorInfo = {
          id: doctor.id,
          name: doctor.name,
          specialtyId: doctor.specialtyId,
          specialtyName: doctor.specialty?.name || 'Unknown',
          isActive: doctor.isActive
        };

        // Get appointment statistics
        const appointmentStats = await Appointment.findAll({
          attributes: [
            'status',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
          ],
          where: { doctorId: doctor.id },
          group: ['status']
        });

        additionalInfo.appointmentStats = appointmentStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.getDataValue('count'));
          return acc;
        }, {});
      }
    }

    // If user is a patient, get appointment statistics
    if (user.role === 'patient') {
      const appointmentStats = await Appointment.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        where: { userId: id },
        group: ['status']
      });

      additionalInfo.appointmentStats = appointmentStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.getDataValue('count'));
        return acc;
      }, {});
    }

    // Get unread notifications count
    const unreadNotificationsCount = await Notification.count({
      where: {
        userId: id,
        isRead: false
      }
    });

    // Get user permissions if admin or self
    let userPermissions = [];
    if (parseInt(id) === req.userId || req.userRole === 'admin') {
      const permissions = await UserPermission.findAll({
        where: { userId: id, isActive: true },
        include: [{
          model: Permission,
          as: 'permission',
          attributes: ['id', 'name', 'description', 'category']
        }]
      });

      userPermissions = permissions.map(p => ({
        id: p.id,
        name: p.permission.name,
        description: p.permission.description,
        category: p.permission.category,
        resourceType: p.resourceType,
        resourceId: p.resourceId,
        expiresAt: p.expiresAt
      }));
    }
    
    res.status(200).json({
      ...user.toJSON(),
      unreadNotificationsCount,
      permissions: userPermissions,
      ...additionalInfo
    });
  } catch (err) {
    console.error(`Error retrieving User with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving User with id=${id}`
    });
  }
};

// Update user
exports.update = async (req, res) => {
  const id = req.params.id;
  
  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - users can only update their own data unless they have permission
    const isAdmin = req.userRole === 'admin';
    const isSelf = parseInt(id) === req.userId;
    const hasPermission = req.userPermissions?.some(p => p.name === 'user:update_all');

    if (!isSelf && !isAdmin && !hasPermission) {
      return res.status(403).json({
        message: 'You do not have permission to update this user profile.'
      });
    }

    // Get the user to update
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} was not found.`
      });
    }

    // Prepare update data
    const updateData = {};
    
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'email', 'phone', 'address'];
    
    // Add fields that only admins can update
    if (isAdmin || hasPermission) {
      allowedFields.push('role', 'isActive', 'isEmailVerified');
    }
    
    // Filter allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          message: 'Invalid email format.'
        });
      }

      // Check if email is already in use by another user
      if (updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { 
            email: updateData.email,
            id: { [Op.ne]: id }
          }
        });

        if (existingUser) {
          return res.status(409).json({
            message: 'Email is already in use by another user.'
          });
        }
      }
    }

    // Track if active status changed
    const activeStatusChanged = 
      updateData.isActive !== undefined && 
      updateData.isActive !== user.isActive;

    // Track if role changed
    const roleChanged = 
      updateData.role !== undefined && 
      updateData.role !== user.role;

    // Add audit information
    updateData.updatedBy = req.userId;
    updateData.updatedAt = new Date();

    // Update user
    await user.update(updateData);

    // If user was deactivated, handle related data
    if (activeStatusChanged && !updateData.isActive) {
      // Send notification to the user
      await sendUserNotification(
        id,
        'account_deactivated',
        { 
          reason: req.body.deactivationReason || 'Administrative decision',
          deactivatedBy: req.userId
        }
      );

      // If user is a doctor, deactivate doctor profile
      if (user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { userId: id } });
        if (doctor) {
          await doctor.update({ 
            isActive: false,
            updatedBy: req.userId,
            updatedAt: new Date()
          });

          // Cancel upcoming appointments
          await Appointment.update(
            { 
              status: 'canceled',
              notes: (appointment) => `${appointment.notes || ''}\nCanceled due to doctor account deactivation.`,
              updatedBy: req.userId
            },
            {
              where: {
                doctorId: doctor.id,
                appointmentDate: { [Op.gt]: new Date() },
                status: { [Op.in]: ['confirmed', 'pending'] }
              }
            }
          );
        }
      }
    }

    // If role changed to doctor, ensure doctor profile exists
    if (roleChanged && updateData.role === 'doctor') {
      // Check if doctor profile already exists
      const existingDoctor = await Doctor.findOne({ where: { userId: id } });
      
      if (!existingDoctor) {
        // Create a placeholder doctor profile
        await Doctor.create({
          userId: id,
          name: user.name,
          specialtyId: null, // This will need to be set later
          isActive: true,
          createdBy: req.userId,
          metadata: {
            createdFromUserUpdate: true,
            needsSpecialty: true
          }
        });

        // Send notification to the user
        await sendUserNotification(
          id,
          'role_changed_to_doctor',
          { 
            message: 'Your account has been upgraded to doctor role. Please complete your doctor profile.'
          }
        );
      }
    }
    
    res.status(200).json({
      message: 'User was updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    console.error(`Error updating User with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error updating User with id=${id}`
    });
  }
};

// Delete user (soft delete by default)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check if user exists
    const user = await User.findByPk(id);
    
    if (!user) 
      return res.status(404).json({
        message: `User with id=${id} was not found.`
      });

    // Check if user has related data
    let relatedData = {};

    // Check if user is a doctor
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: id } });
      
      if (doctor) {
        // Check for appointments
        const appointmentsCount = await Appointment.count({
          where: { doctorId: doctor.id }
        });

        if (appointmentsCount > 0) {
          relatedData.doctorAppointments = appointmentsCount;
        }
      }
    }

    // Check for patient appointments
    const patientAppointmentsCount = await Appointment.count({
      where: { userId: id }
    });

    if (patientAppointmentsCount > 0) {
      relatedData.patientAppointments = patientAppointmentsCount;
    }

    // If user has related data and force deletion is not requested, prevent deletion
    const hasRelatedData = Object.keys(relatedData).length > 0;
    
    if (hasRelatedData && req.query.force !== 'true') {
      return res.status(409).json({
        message: 'User has related data and cannot be deleted.',
        relatedData,
        suggestion: 'Consider deactivating the user instead of deleting, or use ?force=true to force deletion.'
      });
    }

    // Soft delete by default
    if (req.query.force !== 'true') {
      // Soft delete (just mark as inactive and anonymize)
      await user.update({
        isActive: false,
        email: `deleted_${id}_${Date.now()}@deleted.com`, // Anonymize email
        name: `Deleted User ${id}`,
        phone: null,
        address: null,
        updatedBy: req.userId,
        metadata: {
          ...user.metadata,
          deletedAt: new Date(),
          deletedBy: req.userId,
          originalEmail: user.email,
          originalName: user.name
        }
      });

      return res.status(200).json({
        message: 'User was soft-deleted successfully!',
        info: 'The user was marked as inactive and anonymized but not removed from the database. Use ?force=true to permanently delete.'
      });
    }

    // Hard delete if force=true
    // First, delete related data
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: id } });
      if (doctor) {
        // Delete doctor record
        await doctor.destroy();
      }
    }

    // Delete user permissions
    await UserPermission.destroy({
      where: { userId: id }
    });

    // Delete user profile
    await UserProfile.destroy({
      where: { userId: id }
    });

    // Delete notifications
    await Notification.destroy({
      where: { userId: id }
    });

    // Finally delete user
    await user.destroy();
    
    res.status(200).json({
      message: 'User was permanently deleted!'
    });
  } catch (err) {
    console.error(`Error deleting User with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Could not delete User with id=${id}`
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    const profile = await UserProfile.findOne({
      where: { userId: userId }
    });
    
    if (!profile) {
      return res.status(404).json({
        message: `Profile for user with id=${userId} was not found.`
      });
    }
    
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving profile for user with id=${userId}`
    });
  }
};

// Get user permissions
exports.getUserPermissions = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - users can only see their own permissions unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'permission:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s permissions.'
      });
    }

    // Get user permissions
    const permissions = await UserPermission.findAll({
      where: { userId },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['id', 'name', 'description', 'category']
      }]
    });

    // Format permissions
    const formattedPermissions = permissions.map(p => ({
      id: p.id,
      permissionId: p.permissionId,
      name: p.permission.name,
      description: p.permission.description,
      category: p.permission.category,
      resourceType: p.resourceType,
      resourceId: p.resourceId,
      isActive: p.isActive,
      expiresAt: p.expiresAt,
      createdAt: p.createdAt
    }));

    res.status(200).json(formattedPermissions);
  } catch (err) {
    console.error(`Error retrieving permissions for user with id=${userId}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving permissions for user with id=${userId}`
    });
  }
};

// Add permission to user
exports.addUserPermission = async (req, res) => {
  const userId = req.params.userId;
  const { permissionId, resourceType, resourceId, expiresAt } = req.body;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - only admins can add permissions
    if (req.userRole !== 'admin' && !req.userPermissions?.some(p => p.name === 'permission:manage')) {
      return res.status(403).json({
        message: 'You do not have permission to add permissions to users.'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        message: `User with id=${userId} was not found.`
      });
    }

    // Check if permission exists
    const permission = await Permission.findByPk(permissionId);
    
    if (!permission) {
      return res.status(404).json({
        message: `Permission with id=${permissionId} was not found.`
      });
    }

    // Check if user already has this permission
    const existingPermission = await UserPermission.findOne({
      where: { 
        userId,
        permissionId,
        resourceType: resourceType || null,
        resourceId: resourceId || null
      }
    });

    if (existingPermission) {
      // Update existing permission
      await existingPermission.update({
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedBy: req.userId,
        updatedAt: new Date()
      });

      return res.status(200).json({
        message: 'Permission updated successfully!',
        userPermission: existingPermission
      });
    }

    // Create new user permission
    const userPermission = await UserPermission.create({
      userId,
      permissionId,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.userId
    });

    // Send notification to the user
    await sendUserNotification(
      userId,
      'permission_granted',
      { 
        permissionName: permission.name,
        permissionDescription: permission.description,
        grantedBy: req.userId
      }
    );

    res.status(201).json({
      message: 'Permission added successfully!',
      userPermission
    });
  } catch (err) {
    console.error(`Error adding permission to user with id=${userId}:`, err);
    res.status(500).json({
      message: err.message || `Error adding permission to user with id=${userId}`
    });
  }
};

// Remove permission from user
exports.removeUserPermission = async (req, res) => {
  const userId = req.params.userId;
  const permissionId = req.params.permissionId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId)) || isNaN(parseInt(permissionId))) {
      return res.status(400).json({
        message: 'Invalid ID format.'
      });
    }

    // Check permissions - only admins can remove permissions
    if (req.userRole !== 'admin' && !req.userPermissions?.some(p => p.name === 'permission:manage')) {
      return res.status(403).json({
        message: 'You do not have permission to remove permissions from users.'
      });
    }

    // Check if user permission exists
    const userPermission = await UserPermission.findOne({
      where: { userId, permissionId },
      include: [{
        model: Permission,
        as: 'permission',
        attributes: ['name', 'description']
      }]
    });
    
    if (!userPermission) {
      return res.status(404).json({
        message: `Permission with id=${permissionId} for user with id=${userId} was not found.`
      });
    }

    // Soft delete by default (just mark as inactive)
    if (req.query.force !== 'true') {
      await userPermission.update({
        isActive: false,
        updatedBy: req.userId,
        updatedAt: new Date()
      });

      // Send notification to the user
      await sendUserNotification(
        userId,
        'permission_revoked',
        { 
          permissionName: userPermission.permission.name,
          permissionDescription: userPermission.permission.description,
          revokedBy: req.userId
        }
      );

      return res.status(200).json({
        message: 'Permission revoked successfully!',
        info: 'The permission was marked as inactive but not removed from the database. Use ?force=true to permanently delete.'
      });
    }

    // Hard delete if force=true
    await userPermission.destroy();
    
    res.status(200).json({
      message: 'Permission was permanently removed!'
    });
  } catch (err) {
    console.error(`Error removing permission from user with id=${userId}:`, err);
    res.status(500).json({
      message: err.message || `Error removing permission from user with id=${userId}`
    });
  }
};

// Bulk update users (activate/deactivate)
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, action } = req.body;

    // Validate inputs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: 'User IDs array is required.'
      });
    }

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be either "activate" or "deactivate".'
      });
    }

    // Check permissions - only admins can perform bulk updates
    if (req.userRole !== 'admin' && !req.userPermissions?.some(p => p.name === 'user:update_all')) {
      return res.status(403).json({
        message: 'You do not have permission to perform bulk updates on users.'
      });
    }

    // Prepare update data
    const updateData = {
      isActive: action === 'activate',
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Update users
    const [updatedCount] = await User.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    // If deactivating, handle related data
    if (action === 'deactivate') {
      // Get doctor users
      const doctorUsers = await User.findAll({
        where: { 
          id: { [Op.in]: ids },
          role: 'doctor'
        }
      });

      if (doctorUsers.length > 0) {
        const doctorUserIds = doctorUsers.map(user => user.id);
        
        // Deactivate doctor profiles
        await Doctor.update(
          { 
            isActive: false,
            updatedBy: req.userId,
            updatedAt: new Date()
          },
          {
            where: { userId: { [Op.in]: doctorUserIds } }
          }
        );

        // Get doctor IDs
        const doctors = await Doctor.findAll({
          where: { userId: { [Op.in]: doctorUserIds } }
        });

        const doctorIds = doctors.map(doctor => doctor.id);

        // Cancel upcoming appointments for these doctors
        if (doctorIds.length > 0) {
          await Appointment.update(
            { 
              status: 'canceled',
              notes: (appointment) => `${appointment.notes || ''}\nCanceled due to doctor account deactivation.`,
              updatedBy: req.userId
            },
            {
              where: {
                doctorId: { [Op.in]: doctorIds },
                appointmentDate: { [Op.gt]: new Date() },
                status: { [Op.in]: ['confirmed', 'pending'] }
              }
            }
          );
        }
      }

      // Send notifications to all deactivated users
      for (const userId of ids) {
        await sendUserNotification(
          userId,
          'account_deactivated',
          { 
            reason: req.body.deactivationReason || 'Administrative decision',
            deactivatedBy: req.userId
          }
        );
      }
    }

    res.status(200).json({
      message: `${updatedCount} users ${action === 'activate' ? 'activated' : 'deactivated'} successfully.`,
      updatedCount
    });
  } catch (err) {
    console.error('Error performing bulk update on users:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while updating users.'
    });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - users can only see their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'notification:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s notifications.'
      });
    }

    // Get pagination parameters
    const {
      page = 1,
      limit = 10,
      isRead,
      type,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const whereConditions = { userId };
    
    // Add isRead filter if provided
    if (isRead !== undefined) {
      whereConditions.isRead = isRead === 'true';
    }
    
    // Add type filter if provided
    if (type) {
      whereConditions.type = type;
    }

    // Validate sort parameters
    const validSortFields = ['createdAt', 'type', 'isRead'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereConditions,
      order: [[actualSortBy, actualSortOrder]],
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: NotificationTemplate,
        as: 'template',
        attributes: ['id', 'name', 'title', 'content', 'type']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // Format notifications for response
    const formattedNotifications = notifications.map(notification => {
      const data = notification.toJSON();
      
      // Add formatted content with variables replaced
      if (data.template) {
        data.formattedTitle = replaceTemplateVariables(data.template.title, data.variables);
        data.formattedContent = replaceTemplateVariables(data.template.content, data.variables);
      }
      
      return data;
    });

    res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error(`Error retrieving notifications for user with id=${userId}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving notifications for user with id=${userId}`
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId)) || isNaN(parseInt(notificationId))) {
      return res.status(400).json({
        message: 'Invalid ID format.'
      });
    }

    // Check permissions - users can only update their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to update this user\'s notifications.'
      });
    }

    // Find the notification
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        message: `Notification with id=${notificationId} for user with id=${userId} was not found.`
      });
    }

    // Update notification
    await notification.update({
      isRead: true,
      readAt: new Date(),
      updatedBy: req.userId
    });

    res.status(200).json({
      message: 'Notification marked as read successfully.'
    });
  } catch (err) {
    console.error(`Error marking notification as read:`, err);
    res.status(500).json({
      message: err.message || 'Error marking notification as read.'
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: 'Invalid user ID format.'
      });
    }

    // Check permissions - users can only update their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to update this user\'s notifications.'
      });
    }

    // Update all unread notifications
    const [updatedCount] = await Notification.update(
      {
        isRead: true,
        readAt: new Date(),
        updatedBy: req.userId
      },
      {
        where: { userId, isRead: false }
      }
    );

    res.status(200).json({
      message: `${updatedCount} notifications marked as read successfully.`,
      updatedCount
    });
  } catch (err) {
    console.error(`Error marking all notifications as read:`, err);
    res.status(500).json({
      message: err.message || 'Error marking all notifications as read.'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  try {
    // Validate ID format
    if (isNaN(parseInt(userId)) || isNaN(parseInt(notificationId))) {
      return res.status(400).json({
        message: 'Invalid ID format.'
      });
    }

    // Check permissions - users can only delete their own notifications unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.userPermissions?.some(p => p.name === 'notification:manage_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to delete this user\'s notifications.'
      });
    }

    // Find the notification
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (!notification) {
      return res.status(404).json({
        message: `Notification with id=${notificationId} for user with id=${userId} was not found.`
      });
    }

    // Delete notification
    await notification.destroy();

    res.status(200).json({
      message: 'Notification deleted successfully.'
    });
  } catch (err) {
    console.error(`Error deleting notification:`, err);
    res.status(500).json({
      message: err.message || 'Error deleting notification.'
    });
  }
};

// Helper function to replace template variables
function replaceTemplateVariables(template, variables) {
  if (!template || !variables) return template;
  
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\{\{${key}\}\}`, 'g'), value);
  }
  
  return result;
}

// Create or update user profile
exports.updateUserProfile = async (req, res) => {
  const userId = req.params.userId;
  
  // Check if the user is updating their own profile or is an admin
  if (parseInt(userId) !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'You can only update your own profile!'
    });
  }

  try {
    // Check if profile exists
    let profile = await UserProfile.findOne({
      where: { userId: userId }
    });
    
    if (!profile) {
      // Create new profile
      profile = await UserProfile.create({
        userId: userId,
        ...req.body
      });
      
      res.status(201).json({
        message: 'Profile created successfully!',
        profile: profile
      });
    } else {
      // Update existing profile
      await profile.update(req.body);
      
      res.status(200).json({
        message: 'Profile updated successfully!',
        profile: profile
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating profile for user with id=${userId}`
    });
  }
};
