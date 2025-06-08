const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const User = db.user;
const RolePermission = db.rolePermission;
const Permission = db.permission;
const UserPermission = db.userPermission;
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const { Op } = require('sequelize');
const { ROLE_PERMISSION_MAP } = require('@medical-appointment-system/shared-types');

// Register a new user
exports.register = async (req, res) => {

  const { name, email, password, role, phone, address } = req.body;
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) 
      return res.status(400).json({ message: 'Email is already in use!' });

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(password)) 
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.'
      });

    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      status: 'active',
      emailVerified: true,
    });

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
        userId: user.id,
        permissionId: p.id,
        isGranted: true
      }));

      if (userPermissions.length > 0) 
        await UserPermission.bulkCreate(userPermissions);
    }

    // Get user permissions
    const userPermissions = await getUserPermissions(user.id, user.role);

    // Generate token with role and permissions info
    const token = jwt.sign({ 
      id: user.id,
      role: user.role,
      email: user.email,
      permissions: userPermissions // Include permissions in the token
    }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    // Format user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      status: user.status,
      lastLogin: user.lastLogin,
      userProfile: user.userProfile ? {
        id: user.userProfile.id,
        phoneNumber: user.userProfile.phoneNumber,
        address: user.userProfile.address,
        dateOfBirth: user.userProfile.dateOfBirth,
        gender: user.userProfile.gender
      } : null
    };

    // If user is a doctor, include doctor information
    if (user.role === 'doctor' && user.doctorId) {
      const doctor = await db.doctor.findByPk(user.doctorId, {
        include: [{ model: db.specialty, as: 'specialty' }]
      });
      
      if (doctor) {
        userData.doctor = {
          id: doctor.id,
          specialty: doctor.specialty ? doctor.specialty.name : null,
          specialtyId: doctor.specialtyId,
          bio: doctor.bio,
          experience: doctor.experience,
          yearsOfExperience: doctor.yearsOfExperience,
          rating: doctor.rating,
          reviewCount: doctor.reviewCount,
          acceptingNewPatients: doctor.acceptingNewPatients
        };
      }
    }

    res.status(201).json({
      message: 'User registered successfully!',
      user: userData,
      permissions: userPermissions,
      token: token
    });

  } catch (err) {
    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' && Array.isArray(err.errors)) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors.map(e => ({
          message: e.message,
          field: e.path,
        })),
      });
    }
    // Default error handler
    res.status(500).json({
      message: err.message || 'Some error occurred while registering the user.'
    });
  }
};
// // Register a new user
// exports.register = async (req, res) => {

//   const { name, email, password, role, phone, address } = req.body;
//   try {
//     // Check if email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) 
//       return res.status(400).json({ message: 'Email is already in use!' });

//     // Validate password strength
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
//     if (!passwordRegex.test(password)) 
//       return res.status(400).json({ 
//         message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.'
//       });

//     const hashedPassword = bcrypt.hashSync(password, 10);

//     // Create new user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       phone,
//       address,
//       status: 'active',
//       emailVerified: true,
//     });

//     // Assign permissions based on role 
//     if (role && Object.keys(ROLE_PERMISSION_MAP).includes(role)) {
//       let permissionsToAssign = ROLE_PERMISSION_MAP[role];
//       if (role === 'admin') {
//         // Assign all permissions to admin
//         const allPermissions = await Permission.findAll();
//         permissionsToAssign = allPermissions.map(p => p.name);
//       }
//       // Map permission names to IDs
//       const permissionRecords = await Permission.findAll({ where: { name: permissionsToAssign } });
//       const userPermissions = permissionRecords.map(p => ({
//         userId: user.id,
//         permissionId: p.id,
//         isGranted: true
//       }));

//       if (userPermissions.length > 0) 
//         await UserPermission.bulkCreate(userPermissions);
//     }

//     // Generate token
//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//       expiresIn: 86400 // 24 hours
//     });

//     res.status(201).json({
//       message: 'User registered successfully!',
//       user: {
//         id: user.id,
//         name,
//         email,
//         role
//       },
//       token
//     });
//   } catch (err) {
//     // Sequelize validation error
//     if (err.name === 'SequelizeValidationError' && Array.isArray(err.errors)) {
//       return res.status(400).json({
//         message: 'Validation error',
//         errors: err.errors.map(e => ({
//           message: e.message,
//           field: e.path,
//         })),
//       });
//     }
//     // Default error handler
//     res.status(500).json({
//       message: err.message || 'Some error occurred while registering the user.'
//     });
//   }
// };

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token!' });
    }
    
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    
    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while verifying email.'
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    
    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // In a real application, send an email with the reset link
    // For now, just return the token in the response
    res.status(200).json({
      message: 'Password reset link sent to your email!',
      resetToken: resetToken // In production, this should be removed and the token should only be sent via email
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while requesting password reset.'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token!' });
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.'
      });
    }
    
    // Update password
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.passwordChangedAt = new Date();
    await user.save();
    
    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while resetting password.'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    
    // Validate current password
    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Current password is incorrect!' });
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number.'
      });
    }
    
    // Update password
    user.password = bcrypt.hashSync(newPassword, 10);
    user.passwordChangedAt = new Date();
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully!' });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while changing password.'
    });
  }
};

// Helper function to get user permissions
async function getUserPermissions(userId, userRole) {
  try {
    // Get role permissions
    const rolePermissions = await RolePermission.findAll({
      where: { role: userRole },
      include: [{
        model: Permission,
        as: 'permission',
        where: { isActive: true },
        attributes: ['id', 'name', 'description', 'category']
      }]
    });
    
    // Get user-specific permissions
    const userPermissions = await UserPermission.findAll({
      where: { 
        userId: userId,
        isGranted: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      include: [{
        model: Permission,
        as: 'permission',
        where: { isActive: true },
        attributes: ['id', 'name', 'description', 'category']
      }]
    });
    
    // Get explicitly denied permissions
    const deniedPermissions = await UserPermission.findAll({
      where: { 
        userId: userId,
        isGranted: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      attributes: ['permissionId', 'resourceType', 'resourceId']
    });
    
    // Create a map of denied permissions for quick lookup
    const deniedPermissionMap = new Map();
    deniedPermissions.forEach(dp => {
      const key = dp.resourceType && dp.resourceId
        ? `${dp.permissionId}:${dp.resourceType}:${dp.resourceId}`
        : `${dp.permissionId}`;
      deniedPermissionMap.set(key, true);
    });
    
    // Combine permissions
    const rolePerms = rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      description: rp.permission.description,
      category: rp.permission.category,
      source: 'role',
      resourceType: null,
      resourceId: null,
      grantedBy: rp.grantedBy,
      grantedAt: rp.grantedAt
    }));
    
    const userPerms = userPermissions.map(up => ({
      id: up.permission.id,
      name: up.permission.name,
      description: up.permission.description,
      category: up.permission.category,
      source: 'user',
      resourceType: up.resourceType,
      resourceId: up.resourceId,
      expiresAt: up.expiresAt,
      grantedBy: up.grantedBy,
      reason: up.reason
    }));
    
    // Filter out any permissions that are explicitly denied
    const filteredRolePerms = rolePerms.filter(rp => {
      const key = `${rp.id}`;
      return !deniedPermissionMap.has(key);
    });
    
    const filteredUserPerms = userPerms.filter(up => {
      const key = up.resourceType && up.resourceId
        ? `${up.id}:${up.resourceType}:${up.resourceId}`
        : `${up.id}`;
      return !deniedPermissionMap.has(key);
    });
    
    // Combine and remove duplicates (user permissions override role permissions)
    const allPermissions = [...filteredRolePerms];
    
    filteredUserPerms.forEach(up => {
      // If it's a resource-specific permission, always add it
      if (up.resourceType || up.resourceId) {
        allPermissions.push(up);
      } else {
        // For global permissions, replace any role-based one with the same name
        const existingIndex = allPermissions.findIndex(p => p.name === up.name && !p.resourceType && !p.resourceId);
        if (existingIndex >= 0) {
          allPermissions[existingIndex] = up;
        } else {
          allPermissions.push(up);
        }
      }
    });
    
    // Group permissions by category for easier frontend handling
    const permissionsByCategory = {};
    allPermissions.forEach(permission => {
      const category = permission.category || 'general';
      if (!permissionsByCategory[category]) {
        permissionsByCategory[category] = [];
      }
      permissionsByCategory[category].push(permission);
    });
    
    return {
      all: allPermissions,
      // byCategory: permissionsByCategory,
      // // Add convenience methods for checking permissions
      // hasPermission: (permissionName, resourceType = null, resourceId = null) => {
      //   return allPermissions.some(p => {
      //     if (p.name !== permissionName) return false;
          
      //     // Global permission check
      //     if (!resourceType && !resourceId) {
      //       return !p.resourceType && !p.resourceId;
      //     }
          
      //     // Resource-specific permission check
      //     if (resourceType && !resourceId) {
      //       return p.resourceType === resourceType;
      //     }
          
      //     // Specific resource instance permission check
      //     return p.resourceType === resourceType && p.resourceId === resourceId;
      //   });
      // }
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { all: [], byCategory: {}, hasPermission: () => false };
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ 
      where: { 
        email: req.body.email,
        deletedAt: null // Ensure we don't find soft-deleted users
      },
      include: [
        {
          model: db.userProfile,
          as: 'userProfile'
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Please contact support.' });
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    
    if (!passwordIsValid) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.status = 'suspended';
        user.suspensionReason = 'Too many failed login attempts';
        user.suspensionExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      
      return res.status(401).json({
        message: 'Invalid password!',
        token: null,
        remainingAttempts: Math.max(0, 5 - user.failedLoginAttempts)
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      if (user.suspensionExpiresAt && user.suspensionExpiresAt > new Date()) {
        return res.status(403).json({ 
          message: 'Account is temporarily suspended. Please try again later.',
          suspendedUntil: user.suspensionExpiresAt
        });
      } else {
        // Unsuspend account if suspension has expired
        user.status = 'active';
        user.suspensionReason = null;
        user.suspensionExpiresAt = null;
      }
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Get user permissions
    const userPermissions = await getUserPermissions(user.id, user.role);

    // Generate token with role and permissions info
    const token = jwt.sign({ 
      id: user.id,
      role: user.role,
      email: user.email,
      permissions: userPermissions // Include permissions in the token
    }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    // Format user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      status: user.status,
      lastLogin: user.lastLogin,
      userProfile: user.userProfile ? {
        id: user.userProfile.id,
        phoneNumber: user.userProfile.phoneNumber,
        address: user.userProfile.address,
        dateOfBirth: user.userProfile.dateOfBirth,
        gender: user.userProfile.gender
      } : null
    };

    // If user is a doctor, include doctor information
    if (user.role === 'doctor' && user.doctorId) {
      const doctor = await db.doctor.findByPk(user.doctorId, {
        include: [{ model: db.specialty, as: 'specialty' }]
      });
      
      if (doctor) {
        userData.doctor = {
          id: doctor.id,
          specialty: doctor.specialty ? doctor.specialty.name : null,
          specialtyId: doctor.specialtyId,
          bio: doctor.bio,
          experience: doctor.experience,
          yearsOfExperience: doctor.yearsOfExperience,
          rating: doctor.rating,
          reviewCount: doctor.reviewCount,
          acceptingNewPatients: doctor.acceptingNewPatients
        };
      }
    }

    res.status(200).json({
      user: userData,
      permissions: userPermissions,
      token: token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while logging in.'
    });
  }
};

// Get current user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    
    // Get user permissions
    const userPermissions = await getUserPermissions(user.id, user.role);
    
    // Get unread notifications count
    const unreadNotificationsCount = await Notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });
    
    res.status(200).json({
      ...user.toJSON(),
      permissions: userPermissions,
      unreadNotificationsCount
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving user profile.'
    });
  }
};
