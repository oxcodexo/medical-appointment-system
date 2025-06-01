const db = require("../models");
const UserPermission = db.userPermission;
const Permission = db.permission;
const User = db.user;
const { Op } = require("sequelize");

// Create and Save a new UserPermission
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.userId || !req.body.permissionId) {
      return res.status(400).json({
        message: "UserId and permissionId are required fields!"
      });
    }

    // Check if user exists
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      return res.status(404).json({
        message: `User with ID ${req.body.userId} not found!`
      });
    }

    // Check if permission exists
    const permission = await Permission.findByPk(req.body.permissionId);
    if (!permission) {
      return res.status(404).json({
        message: `Permission with ID ${req.body.permissionId} not found!`
      });
    }

    // Check if user-permission combination already exists
    const existingUserPermission = await UserPermission.findOne({
      where: {
        userId: req.body.userId,
        permissionId: req.body.permissionId,
        resourceType: req.body.resourceType || null,
        resourceId: req.body.resourceId || null
      }
    });

    if (existingUserPermission) {
      return res.status(400).json({
        message: `User with ID ${req.body.userId} already has permission with ID ${req.body.permissionId} for this resource!`
      });
    }

    // Create a UserPermission
    const userPermission = {
      userId: req.body.userId,
      permissionId: req.body.permissionId,
      resourceType: req.body.resourceType || null,
      resourceId: req.body.resourceId || null,
      grantedBy: req.body.grantedBy || req.userId, // Use the ID of the user making the request
      grantedAt: new Date(),
      expiresAt: req.body.expiresAt || null,
      reason: req.body.reason || null,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    // Save UserPermission in the database
    const data = await UserPermission.create(userPermission);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the UserPermission."
    });
  }
};

// Retrieve all UserPermissions
exports.findAll = async (req, res) => {
  try {
    const userId = req.query.userId;
    const resourceType = req.query.resourceType;
    const isActive = req.query.isActive;
    
    let condition = {};
    
    if (userId) {
      condition.userId = userId;
    }
    
    if (resourceType) {
      condition.resourceType = resourceType;
    }
    
    if (isActive !== undefined) {
      condition.isActive = isActive === 'true';
    }
    
    const data = await UserPermission.findAll({ 
      where: condition,
      include: [
        {
          model: Permission,
          as: 'permission'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['userId', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving user permissions."
    });
  }
};

// Find all permissions for a user
exports.findByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: `User with ID ${userId} not found!`
      });
    }
    
    const data = await UserPermission.findAll({
      where: { 
        userId: userId,
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      include: [{
        model: Permission,
        as: 'permission',
        where: { isActive: true }
      }]
    });
    
    // Extract just the permissions from the user permissions
    const permissions = data.map(up => ({
      ...up.permission.toJSON(),
      resourceType: up.resourceType,
      resourceId: up.resourceId,
      expiresAt: up.expiresAt
    }));
    
    res.json(permissions);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving permissions for the user."
    });
  }
};

// Find a single UserPermission with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const data = await UserPermission.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permission'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    if (!data) {
      return res.status(404).json({
        message: `UserPermission with ID ${id} not found!`
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the user permission."
    });
  }
};

// Update a UserPermission
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await UserPermission.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "UserPermission was updated successfully."
      });
    } else {
      res.status(404).json({
        message: `Cannot update UserPermission with ID ${id}. Maybe UserPermission was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while updating the user permission."
    });
  }
};

// Delete a UserPermission
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await UserPermission.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "UserPermission was deleted successfully!"
      });
    } else {
      res.status(404).json({
        message: `Cannot delete UserPermission with ID ${id}. Maybe UserPermission was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the user permission."
    });
  }
};

// Delete all permissions for a user
exports.deleteByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const num = await UserPermission.destroy({
      where: { userId: userId }
    });
    
    res.json({
      message: `${num} UserPermissions were deleted successfully!`
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting user permissions."
    });
  }
};

// Check if a user has a specific permission
exports.checkPermission = async (req, res) => {
  try {
    const userId = req.params.userId;
    const permissionName = req.params.permissionName;
    const resourceType = req.query.resourceType;
    const resourceId = req.query.resourceId;
    
    // Find the permission by name
    const permission = await Permission.findOne({
      where: { name: permissionName, isActive: true }
    });
    
    if (!permission) {
      return res.status(404).json({
        message: `Permission with name ${permissionName} not found!`
      });
    }
    
    // Build condition for checking user permission
    let condition = {
      userId: userId,
      permissionId: permission.id,
      isActive: true,
      [Op.or]: [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } }
      ]
    };
    
    // If resource is specified, check for resource-specific permission
    if (resourceType && resourceId) {
      condition = {
        ...condition,
        [Op.or]: [
          { resourceType: null, resourceId: null }, // Global permission
          { resourceType: resourceType, resourceId: null }, // Type-wide permission
          { resourceType: resourceType, resourceId: resourceId } // Resource-specific permission
        ]
      };
    }
    
    // Check if the user has this permission
    const userPermission = await UserPermission.findOne({
      where: condition
    });
    
    res.json({
      hasPermission: !!userPermission
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while checking the permission."
    });
  }
};

// Activate a UserPermission
exports.activate = async (req, res) => {
  try {
    const id = req.params.id;
    
    const userPermission = await UserPermission.findByPk(id);
    
    if (!userPermission) {
      return res.status(404).json({
        message: `UserPermission with ID ${id} not found!`
      });
    }
    
    userPermission.isActive = true;
    await userPermission.save();
    
    res.json({
      message: "UserPermission was activated successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while activating the user permission."
    });
  }
};

// Deactivate a UserPermission
exports.deactivate = async (req, res) => {
  try {
    const id = req.params.id;
    
    const userPermission = await UserPermission.findByPk(id);
    
    if (!userPermission) {
      return res.status(404).json({
        message: `UserPermission with ID ${id} not found!`
      });
    }
    
    userPermission.isActive = false;
    await userPermission.save();
    
    res.json({
      message: "UserPermission was deactivated successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deactivating the user permission."
    });
  }
};
