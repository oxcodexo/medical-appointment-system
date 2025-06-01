const db = require("../models");
const User = db.user;
const Role = db.role;
const Permission = db.permission;
const RolePermission = db.rolePermission;
const UserPermission = db.userPermission;
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { Sequelize } = require('sequelize');

const authJwt = {};

// Verify the JWT token
authJwt.verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      message: "No token provided!"
    });
  }

  // Remove Bearer prefix if present
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }
  
  if (!token) {
    return res.status(401).json({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.permissions = decoded.permissions;

    next();
  });
};

// Check if user is active
authJwt.isActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({
        message: "Account is not active. Please contact support."
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error checking user status."
    });
  }
};

// Check if user is admin
authJwt.isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
    return;
  }
  
  res.status(403).json({
    message: "Require Admin Role!"
  });
};

// Check if user is doctor
authJwt.isDoctor = (req, res, next) => {
  if (req.userRole === 'doctor') {
    next();
    return;
  }
  
  res.status(403).json({
    message: "Require Doctor Role!"
  });
};

// Check if user is patient
authJwt.isPatient = (req, res, next) => {
  if (req.userRole === 'patient') {
    next();
    return;
  }
  
  res.status(403).json({
    message: "Require Patient Role!"
  });
};

// Check if user is responsable
authJwt.isResponsable = (req, res, next) => {
  if (req.userRole === 'responsable') {
    next();
    return;
  }
  
  res.status(403).json({
    message: "Require Responsable Role!"
  });
};

// Check if user has any of the specified roles
authJwt.hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.userRole)) {
      next();
      return;
    }
    
    res.status(403).json({
      message: `Require one of these roles: ${roles.join(', ')}`
    });
  };
};

// Check if user has a specific permission
authJwt.hasPermission = (permissionName, resourceType = null, resourceId = null) => {
  return async (req, res, next) => {
    try {
      // Admin always has all permissions
      if (req.userRole === 'admin') {
        next();
        return;
      }
      
      // Special case for 'user:view_own' and 'user:update_own' permissions
      if (
        (permissionName === 'user:view_own' || permissionName === 'user:update_own') && 
        req.params.userId && 
        parseInt(req.params.userId) === req.userId
      ) {
        next();
        return;
      }
      
      // Special case for 'notification:view_own' and 'notification:update_own' permissions
      if (
        (permissionName === 'notification:view_own' || permissionName === 'notification:update_own') && 
        req.params.userId && 
        parseInt(req.params.userId) === req.userId
      ) {
        next();
        return;
      }
      
      // Get role permissions
      const rolePermissions = await RolePermission.findAll({
        where: { role: req.userRole },
        include: [{
          model: Permission,
          as: 'permission',
          where: { isActive: true },
          required: true
        }]
      });
      
      // Check if user has the permission through their role
      const hasRolePermission = rolePermissions.some(rp => {
        if (rp.permission.name !== permissionName) return false;
        
        // Global permission check
        if (!resourceType && !resourceId) {
          return !rp.resourceType && !rp.resourceId;
        }
        
        // Resource-type permission check
        if (resourceType && !resourceId) {
          return rp.resourceType === resourceType;
        }
        
        // Specific resource instance permission check
        return rp.resourceType === resourceType && rp.resourceId === resourceId;
      });
      
      if (hasRolePermission) {
        next();
        return;
      }
      
      // Get user-specific permissions
      const userPermissions = await UserPermission.findAll({
        where: { 
          userId: req.userId,
          isGranted: true,
          [Sequelize.Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Sequelize.Op.gt]: new Date() } }
          ]
        },
        include: [{
          model: Permission,
          as: 'permission',
          where: { isActive: true },
          required: true
        }]
      });

      // Get denied permissions
      const deniedPermissions = await UserPermission.findAll({
        where: { 
          userId: req.userId,
          isGranted: false
        },
        include: [{
          model: Permission,
          as: 'permission',
          where: { isActive: true },
          required: true
        }]
      });

      // Store all permissions in request for later use
      const allPermissions = [];
      
      // Add role permissions
      rolePermissions.forEach(rp => {
        allPermissions.push({
          id: rp.id,
          name: rp.permission.name,
          category: rp.permission.category,
          source: 'role',
          resourceType: rp.resourceType,
          resourceId: rp.resourceId
        });
      });
      
      // Add user permissions
      userPermissions.forEach(up => {
        allPermissions.push({
          id: up.id,
          name: up.permission.name,
          category: up.permission.category,
          source: 'user',
          resourceType: up.resourceType,
          resourceId: up.resourceId,
          expiresAt: up.expiresAt,
          grantedBy: up.grantedBy,
          grantedAt: up.createdAt,
          reason: up.reason
        });
      });
      
      // Store in request
      req.userPermissions = allPermissions;
      
      // Check if the permission is denied
      const isDenied = deniedPermissions.some(dp => 
        dp.permission.name === permissionName &&
        (!resourceType || dp.resourceType === resourceType) &&
        (!resourceId || dp.resourceId === resourceId)
      );
      
      if (isDenied) {
        return res.status(403).json({
          message: `Permission denied: ${permissionName}`
        });
      }
      
      // Check if user has the required permission
      const hasPermission = allPermissions.some(p => {
        // Check permission name
        if (p.name !== permissionName) return false;
        
        // Global permission check
        if (!resourceType && !resourceId) {
          return !p.resourceType && !p.resourceId;
        }
        
        // Resource-type permission check
        if (resourceType && !resourceId) {
          return p.resourceType === resourceType;
        }
        
        // Specific resource instance permission check
        return p.resourceType === resourceType && p.resourceId === resourceId;
      });

      if (hasPermission) {
        next();
        return;
      }

      res.status(403).json({
        message: `Require permission: ${permissionName}`
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error checking permissions!'
      });
    }
  };
};

// Check if user has any of the specified permissions
authJwt.hasAnyPermission = (permissionNames, resourceType = null, resourceId = null) => {
  return async (req, res, next) => {
    try {
      // Admin always has all permissions
      if (req.userRole === 'admin') {
        next();
        return;
      }
      // Special case for user viewing their own data
      if (
        (permissionNames.includes('user:view_own') || permissionNames.includes('user:update_own')) && 
        req.params.userId && 
        parseInt(req.params.userId) === req.userId
      ) {
        next();
        return;
      }

      // Special case for user viewing their own notifications
      if (
        (permissionNames.includes('notification:view_own') || permissionNames.includes('notification:view_all')) && 
        req.path.startsWith('/api/notifications/user/') && 
        req.params.userId && 
        parseInt(req.params.userId) === req.userId
      ) {
        next();
        return;
      }

      // Get role permissions
      const rolePermissions = await RolePermission.findAll({
        where: { role: req.userRole },
        include: [{
          model: Permission,
          attributes: ['id', 'name', 'category'],
          where: { isActive: true }
        }]
      });

      // Check if user has any of the required permissions through role
      const hasRolePermission = permissionNames.some(permName => {
        return rolePermissions.some(rp => {
          if (rp.permission && rp.permission.name === permName) {
            // Global permission check
            if (!resourceType && !resourceId) {
              return !rp.resourceType && !rp.resourceId;
            }
            
            // Resource-type permission check
            if (resourceType && !resourceId) {
              return rp.resourceType === resourceType;
            }
            
            // Specific resource instance permission check
            return rp.resourceType === resourceType && rp.resourceId === resourceId;
          }
          return false;
        });
      });

      if (hasRolePermission) {
        next();
        return;
      }

      // Get user-specific permissions
      const userPermissions = await UserPermission.findAll({
        where: { 
          userId: req.userId,
          isGranted: true,
          [Sequelize.Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Sequelize.Op.gt]: new Date() } }
          ]
        },
        include: [{
          model: Permission,
          attributes: ['id', 'name', 'category'],
          where: { isActive: true }
        }]
      });

      // Check if user has any of the required permissions directly
      const hasUserPermission = permissionNames.some(permName => {
        return userPermissions.some(up => {
          if (up.permission && up.permission.name === permName) {
            // Global permission check
            if (!resourceType && !resourceId) {
              return !up.resourceType && !up.resourceId;
            }
            
            // Resource-type permission check
            if (resourceType && !resourceId) {
              return up.resourceType === resourceType;
            }
            
            // Specific resource instance permission check
            return up.resourceType === resourceType && up.resourceId === resourceId;
          }
          return false;
        });
      });

      if (hasUserPermission) {
        next();
        return;
      }

      // Check for denied permissions
      const deniedPermissions = await UserPermission.findAll({
        where: { 
          userId: req.userId,
          isGranted: false
        },
        include: [{
          model: Permission,
          attributes: ['id', 'name'],
          where: { 
            isActive: true,
            name: { [Sequelize.Op.in]: permissionNames }
          }
        }]
      });

      // If there's a denied permission that matches, deny access
      const isDenied = deniedPermissions.some(dp => {
        if (dp.permission && permissionNames.includes(dp.permission.name)) {
          // Global denial
          if (!resourceType && !resourceId) {
            return !dp.resourceType && !dp.resourceId;
          }
          
          // Resource-type denial
          if (resourceType && !resourceId) {
            return dp.resourceType === resourceType;
          }
          
          // Specific resource instance denial
          return dp.resourceType === resourceType && dp.resourceId === resourceId;
        }
        return false;
      });

      if (isDenied) {
        return res.status(403).json({
          message: `Permission denied: ${permissionNames.join(', ')}`
        });
      }

      res.status(403).json({
        message: `Require one of these permissions: ${permissionNames.join(', ')}`
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      res.status(500).json({
        message: 'Error checking permissions!'
      });
    }
  };
};

// Check if user has permission for a specific resource
authJwt.hasResourcePermission = (permissionName, resourceType, getResourceIdFn) => {
  return async (req, res, next) => {
    try {
      // Admin always has all permissions
      if (req.userRole === 'admin') {
        next();
        return;
      }

      // Get resource ID from request using the provided function
      const resourceId = getResourceIdFn(req);

      // Get user permissions
      const userPermissions = await UserPermission.findAll({
        where: { 
          userId: req.userId,
          isActive: true
        },
        include: [{
          model: Permission,
          as: 'permission',
          attributes: ['name']
        }]
      });

      // Store user permissions in request for later use
      req.userPermissions = userPermissions.map(up => ({
        id: up.id,
        name: up.permission.name,
        resourceType: up.resourceType,
        resourceId: up.resourceId,
        expiresAt: up.expiresAt
      }));

      // Check if user has global permission
      const hasGlobalPermission = userPermissions.some(up => 
        up.permission.name === permissionName && 
        !up.resourceType && 
        !up.resourceId && 
        (!up.expiresAt || new Date(up.expiresAt) > new Date())
      );

      if (hasGlobalPermission) {
        next();
        return;
      }

      // Check if user has resource-specific permission
      const hasResourcePermission = userPermissions.some(up => 
        up.permission.name === permissionName && 
        up.resourceType === resourceType && 
        up.resourceId === resourceId && 
        (!up.expiresAt || new Date(up.expiresAt) > new Date())
      );

      if (hasResourcePermission) {
        next();
        return;
      }

      res.status(403).json({
        message: `Require permission: ${permissionName} for ${resourceType} with ID ${resourceId}`
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error checking resource permissions!'
      });
    }
  };
};

module.exports = authJwt;
