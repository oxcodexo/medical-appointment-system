const db = require('../models');
const Specialty = db.specialty;
const Doctor = db.doctor;
const { Op } = db.Sequelize;

// Get all specialties
exports.findAll = async (req, res) => {
  try {
    const specialties = await Specialty.findAll();
    res.status(200).json(specialties);
  } catch (err) {
    console.error('Error retrieving specialties:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving specialties.'
    });
  }
};

// Get specialty by id with doctor count
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid specialty ID format.'
      });
    }

    // Get specialty
    const specialty = await Specialty.findByPk(id);
    
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${id} was not found.`
      });
    }

    // Count doctors in this specialty
    const doctorCount = await Doctor.count({
      where: { specialtyId: id }
    });
    
    // Return specialty with doctor count
    res.status(200).json({
      ...specialty.toJSON(),
      doctorCount
    });
  } catch (err) {
    console.error(`Error retrieving Specialty with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving Specialty with id=${id}`
    });
  }
};

// Create a new specialty
exports.create = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        message: 'Specialty name is required.'
      });
    }

    // Check if specialty with the same name already exists
    const existingSpecialty = await Specialty.findOne({
      where: { name: req.body.name }
    });

    if (existingSpecialty) {
      return res.status(409).json({
        message: `Specialty with name '${req.body.name}' already exists.`
      });
    }

    // Create specialty with audit information
    const specialty = await Specialty.create({
      name: req.body.name,
      description: req.body.description || '',
      icon: req.body.icon || null,
      color: req.body.color || '#3498db', // Default blue color
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdBy: req.userId,
      metadata: req.body.metadata || {}
    });

    res.status(201).json({
      message: 'Specialty created successfully!',
      specialty
    });
  } catch (err) {
    console.error('Error creating specialty:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Specialty.'
    });
  }
};

// Update a specialty
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid specialty ID format.'
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(id);
    
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${id} was not found.`
      });
    }

    // If updating name, check if the new name already exists
    if (req.body.name && req.body.name !== specialty.name) {
      const existingSpecialty = await Specialty.findOne({
        where: { 
          name: req.body.name,
          id: { [Op.ne]: id }
        }
      });

      if (existingSpecialty) {
        return res.status(409).json({
          message: `Specialty with name '${req.body.name}' already exists.`
        });
      }
    }

    // Prepare update data
    const updateData = {};
    
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'description', 'icon', 'color', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Add audit information
    updateData.updatedBy = req.userId;
    updateData.updatedAt = new Date();

    // Track if active status changed
    const activeStatusChanged = 
      req.body.isActive !== undefined && 
      req.body.isActive !== specialty.isActive;

    // Update specialty
    await specialty.update(updateData);

    // If specialty was deactivated, check for doctors using it
    if (activeStatusChanged && !req.body.isActive) {
      const doctorsCount = await Doctor.count({
        where: { specialtyId: id }
      });

      if (doctorsCount > 0) {
        // Just include this information in the response
        // We don't automatically deactivate doctors
        return res.status(200).json({
          message: 'Specialty was updated successfully, but there are doctors using this specialty.',
          specialty,
          affectedDoctors: doctorsCount,
          warning: 'This specialty is used by doctors. Consider reassigning them before completely removing this specialty.'
        });
      }
    }
    
    res.status(200).json({
      message: 'Specialty was updated successfully.',
      specialty
    });
  } catch (err) {
    console.error(`Error updating Specialty with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error updating Specialty with id=${id}`
    });
  }
};

// Get doctors by specialty
exports.getDoctors = async (req, res) => {
  const id = req.params.id;
  const { page = 1, limit = 10, isActive } = req.query;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid specialty ID format.'
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(id);
    
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${id} was not found.`
      });
    }

    // Build filter conditions
    const whereConditions = { specialtyId: id };
    
    // Add active status filter if provided
    if (isActive !== undefined) {
      whereConditions.isActive = isActive === 'true';
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get doctors with pagination
    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where: whereConditions,
      limit: parsedLimit,
      offset: offset,
      include: [{
        model: db.user,
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);

    res.status(200).json({
      specialty: {
        id: specialty.id,
        name: specialty.name
      },
      doctors,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit
      }
    });
  } catch (err) {
    console.error(`Error retrieving doctors for specialty with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving doctors for specialty with id=${id}`
    });
  }
};

// Bulk update specialties (activate/deactivate)
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, action } = req.body;

    // Validate inputs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: 'Specialty IDs array is required.'
      });
    }

    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be either "activate" or "deactivate".'
      });
    }

    // Prepare update data
    const updateData = {
      isActive: action === 'activate',
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Update specialties
    const [updatedCount] = await Specialty.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    // If deactivating, check for affected doctors
    let affectedDoctors = 0;
    if (action === 'deactivate') {
      affectedDoctors = await Doctor.count({
        where: { 
          specialtyId: { [Op.in]: ids },
          isActive: true
        }
      });
    }

    res.status(200).json({
      message: `${updatedCount} specialties ${action === 'activate' ? 'activated' : 'deactivated'} successfully.`,
      updatedCount,
      affectedDoctors: action === 'deactivate' ? affectedDoctors : 0,
      warning: affectedDoctors > 0 ? 
        `${affectedDoctors} active doctors are affected by this change. Consider reassigning them to other specialties.` : 
        null
    });
  } catch (err) {
    console.error('Error performing bulk update on specialties:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while updating specialties.'
    });
  }
};

// Delete a specialty
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate ID format
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Invalid specialty ID format.'
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(id);
    
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${id} was not found.`
      });
    }

    // Check if there are doctors using this specialty
    const doctorsCount = await Doctor.count({
      where: { specialtyId: id }
    });

    if (doctorsCount > 0) {
      return res.status(409).json({
        message: `Cannot delete Specialty with id=${id}. There are ${doctorsCount} doctors using this specialty.`,
        doctorsCount,
        suggestion: 'Consider deactivating the specialty instead of deleting it, or reassign the doctors to another specialty.'
      });
    }

    // Soft delete by default
    if (req.query.force !== 'true') {
      // Soft delete (just mark as inactive)
      await specialty.update({
        isActive: false,
        updatedBy: req.userId,
        metadata: {
          ...specialty.metadata,
          deletedAt: new Date(),
          deletedBy: req.userId
        }
      });

      return res.status(200).json({
        message: 'Specialty was soft-deleted successfully!',
        info: 'The specialty was marked as inactive but not removed from the database. Use ?force=true to permanently delete.'
      });
    }

    // Hard delete if force=true
    await specialty.destroy();
    
    res.status(200).json({
      message: 'Specialty was permanently deleted!'
    });
  } catch (err) {
    console.error(`Error deleting Specialty with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Could not delete Specialty with id=${id}`
    });
  }
};
