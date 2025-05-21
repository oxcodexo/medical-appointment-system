const db = require('../models');
const Appointment = db.appointment;
const Doctor = db.doctor;
const User = db.user;
const Specialty = db.specialty;

// Get all appointments
exports.findAll = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Doctor,
          include: [
            {
              model: Specialty,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error retrieving all appointments:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving appointments.'
    });
  }
};

// Get appointment by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Doctor,
          include: [
            {
              model: Specialty,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });
    }
    
    res.status(200).json(appointment);
  } catch (err) {
    console.error(`Error retrieving appointment with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error retrieving Appointment with id=${id}`
    });
  }
};

// Create a new appointment
exports.create = async (req, res) => {
  try {
    // Create appointment
    const appointment = await Appointment.create({
      ...req.body,
      status: 'pending'
    });
    
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Appointment.'
    });
  }
};

// Update appointment status
exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { status, notes } = req.body;

  try {
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });
    }
    
    // Update status and notes if provided
    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    
    await appointment.save();
    
    res.status(200).json({
      message: 'Appointment status updated successfully!',
      appointment
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating status for Appointment with id=${id}`
    });
  }
};

// Update appointment
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Appointment.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Appointment was updated successfully.'
      });
    } else {
      res.status(404).json({
        message: `Cannot update Appointment with id=${id}. Maybe Appointment was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating Appointment with id=${id}`
    });
  }
};

// Delete appointment
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Appointment.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Appointment was deleted successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Appointment with id=${id}. Maybe Appointment was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Could not delete Appointment with id=${id}`
    });
  }
};

// Get appointments for doctor
exports.findByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const appointments = await Appointment.findAll({
      where: { doctorId: doctorId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error retrieving appointments for doctor:', err);
    res.status(500).json({
      message: err.message || `Error retrieving Appointments for doctor with id=${doctorId}`
    });
  }
};

// Get appointments for user
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const appointments = await Appointment.findAll({
      where: { userId: userId },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: db.specialty,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error retrieving appointments for user:', err);
    res.status(500).json({
      message: err.message || `Error retrieving Appointments for user with id=${userId}`
    });
  }
};

// Cancel appointment
exports.cancel = async (req, res) => {
  const id = req.params.id;

  try {
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });
    }
    
    appointment.status = 'canceled';
    await appointment.save();
    
    res.status(200).json({
      message: 'Appointment canceled successfully!',
      appointment
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error canceling Appointment with id=${id}`
    });
  }
};
