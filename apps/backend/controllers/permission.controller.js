const db = require("../models");
const Permission = db.permission;
const RolePermission = db.rolePermission;
const UserPermission = db.userPermission;
const { Op } = require("sequelize");

// Create and Save a new Permission
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name || !req.body.description) {
      return res.status(400).json({
        message: "Name and description are required fields!"
      });
    }

    // Create a Permission
    const permission = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category || "general",
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };

    // Save Permission in the database
    const data = await Permission.create(permission);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the Permission."
    });
  }
};

// Retrieve all Permissions
exports.findAll = async (req, res) => {
  try {
    const category = req.query.category;
    const isActive = req.query.isActive;
    
    let condition = {};
    
    if (category) {
      condition.category = category;
    }
    
    if (isActive !== undefined) {
      condition.isActive = isActive === 'true';
    }
    
    const data = await Permission.findAll({ 
      where: condition,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving permissions."
    });
  }
};

// Find a single Permission with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const data = await Permission.findByPk(id);
    
    if (!data) {
      return res.status(404).json({
        message: `Permission with ID ${id} not found!`
      });
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving the permission."
    });
  }
};

// Find Permissions by category
exports.findByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    const data = await Permission.findAll({
      where: { 
        category: category,
        isActive: true
      },
      order: [['name', 'ASC']]
    });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving permissions by category."
    });
  }
};

// Update a Permission
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const num = await Permission.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "Permission was updated successfully."
      });
    } else {
      res.status(404).json({
        message: `Cannot update Permission with ID ${id}. Maybe Permission was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while updating the permission."
    });
  }
};

// Delete a Permission
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if permission is used in role permissions or user permissions
    const rolePermCount = await RolePermission.count({
      where: { permissionId: id }
    });
    
    const userPermCount = await UserPermission.count({
      where: { permissionId: id }
    });
    
    if (rolePermCount > 0 || userPermCount > 0) {
      return res.status(400).json({
        message: `Cannot delete Permission with ID ${id} because it is used in ${rolePermCount} role permissions and ${userPermCount} user permissions.`
      });
    }
    
    const num = await Permission.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.json({
        message: "Permission was deleted successfully!"
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Permission with ID ${id}. Maybe Permission was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deleting the permission."
    });
  }
};

// Activate a Permission
exports.activate = async (req, res) => {
  try {
    const id = req.params.id;
    
    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({
        message: `Permission with ID ${id} not found!`
      });
    }
    
    permission.isActive = true;
    await permission.save();
    
    res.json({
      message: "Permission was activated successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while activating the permission."
    });
  }
};

// Deactivate a Permission
exports.deactivate = async (req, res) => {
  try {
    const id = req.params.id;
    
    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({
        message: `Permission with ID ${id} not found!`
      });
    }
    
    permission.isActive = false;
    await permission.save();
    
    res.json({
      message: "Permission was deactivated successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while deactivating the permission."
    });
  }
};
