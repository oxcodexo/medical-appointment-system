const db = require('../models');
const Specialty = db.specialty;

// Get all specialties
exports.findAll = async (req, res) => {
  try {
    const specialties = await Specialty.findAll();
    res.status(200).json(specialties);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving specialties.'
    });
  }
};

// Get specialty by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const specialty = await Specialty.findByPk(id);
    
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${id} was not found.`
      });
    }
    
    res.status(200).json(specialty);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Specialty with id=${id}`
    });
  }
};

// Create a new specialty
exports.create = async (req, res) => {
  try {
    // Create specialty
    const specialty = await Specialty.create(req.body);
    res.status(201).json(specialty);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Specialty.'
    });
  }
};

// Update a specialty
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Specialty.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Specialty was updated successfully.'
      });
    } else {
      res.status(404).json({
        message: `Cannot update Specialty with id=${id}. Maybe Specialty was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating Specialty with id=${id}`
    });
  }
};

// Delete a specialty
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Specialty.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Specialty was deleted successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Specialty with id=${id}. Maybe Specialty was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Could not delete Specialty with id=${id}`
    });
  }
};
