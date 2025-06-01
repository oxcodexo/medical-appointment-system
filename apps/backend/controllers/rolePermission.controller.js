const db = require("../models");
const RolePermission = db.rolePermission;
const Permission = db.permission;
const { Op } = require("sequelize");

// Create and Save a new RolePermission
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.role || !req.body.permissionId) {
      return res.status(400).json({
        message: "Role and permissionId are required fields!"
      });
    }

    // Check if permission exists
    const permission = await Permission.findByPk(req.body.permissionId);
    if (!permission) {
      return res.status(404).json({
        message: `Permission with ID ${req.body.permissionId} not found!`
      });
    }

    // Check if role-permission combination already exists
    const existingRolePermission = await RolePermission.findOne({
      where: {
        role: req.body.role,
        permissionId: req.body.permissionId
      }
    });

    if (existingRolePermission) {
      return res.status(400).json({
        message: `Role ${req.body.role} already has permission with ID ${req.body.permissionId}!`
      });
    }

    // Create a RolePermission
    const rolePermission = {
      role: req.body.role,
      permissionId: req.body.permissionId,
      grantedBy: req.body.grantedBy || req.userId, // Use the ID of the user making the request
      grantedAt: new Date()
    };

    // Save RolePermission in the database
    const data = await RolePermission.create(rolePermission);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the RolePermission."
    });
  }
};

// Retrieve all RolePermissions
exports.findAll = async (req, res) => {
  try {
    const role = req.query.role;
    
    let condition = {};
    
    if (role) {
      condition.role = role;
    }
    
    const data = await RolePermission.findAll({ 
      where: condition,
      include: [{
        model: Permission,
        as: 'permission'
      }],
      order: [['role', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving role permissions."
    });
  }
};

// Find all permissions for a role
exports.findByRole = async (req, res) => {
  try {
    const role = req.params.role;
    
    const data = await RolePermission.findAll({
      where: { role: role },
      include: [{
        model: Permission,
        as: 'permission'
      }]
    });
    
    // Extract just the permissions from the role permissions
    const permissions = data.map(rp => rp.permission);
    
    res.json(permissions);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving permissions for the role."
    });
  }
};

// Find a single RolePermission with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const data = await RolePermission.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permission'
      }]
    });
    
    if (!data) {
      return res.status(404).json({
        message: `RolePermission with ID ${id} not found!`
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the role permission."
    });
  }
};

// Delete a RolePermission
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await RolePermission.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "RolePermission was deleted successfully!"
      });
    } else {
      res.status(404).json({
        message: `Cannot delete RolePermission with ID ${id}. Maybe RolePermission was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the role permission."
    });
  }
};

// Delete all permissions for a role
exports.deleteByRole = async (req, res) => {
  try {
    const role = req.params.role;
    
    const num = await RolePermission.destroy({
      where: { role: role }
    });
    
    res.json({
      message: `${num} RolePermissions were deleted successfully!`
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting role permissions."
    });
  }
};

// Check if a role has a specific permission
exports.checkPermission = async (req, res) => {
  try {
    const role = req.params.role;
    const permissionName = req.params.permissionName;
    
    // Find the permission by name
    const permission = await Permission.findOne({
      where: { name: permissionName, isActive: true }
    });
    
    if (!permission) {
      return res.status(404).json({
        message: `Permission with name ${permissionName} not found!`
      });
    }
    
    // Check if the role has this permission
    const rolePermission = await RolePermission.findOne({
      where: {
        role: role,
        permissionId: permission.id
      }
    });
    
    res.json({
      hasPermission: !!rolePermission
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while checking the permission."
    });
  }
};
