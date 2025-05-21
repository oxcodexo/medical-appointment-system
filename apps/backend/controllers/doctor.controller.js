const db = require('../models');
const Doctor = db.doctor;
const Specialty = db.specialty;
const DoctorAvailability = db.doctorAvailability;
const DoctorAbsence = db.doctorAbsence;
const User = db.user;
const Appointment = db.appointment;

// Get all doctors
exports.findAll = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        },
        {
          model: DoctorAbsence,
          attributes: ['id', 'startDate', 'endDate', 'reason']
        }
      ]
    });
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while retrieving doctors.'
    });
  }
};

// Get doctor by id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        },
        {
          model: DoctorAbsence,
          attributes: ['id', 'startDate', 'endDate', 'reason']
        }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with id=${id} was not found.`
      });
    }
    
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Doctor with id=${id}`
    });
  }
};

// Create a new doctor
exports.create = async (req, res) => {
  try {
    // Create doctor
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Doctor.'
    });
  }
};

// Update a doctor
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Doctor.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Doctor was updated successfully.'
      });
    } else {
      res.status(404).json({
        message: `Cannot update Doctor with id=${id}. Maybe Doctor was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error updating Doctor with id=${id}`
    });
  }
};

// Delete a doctor
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Doctor.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Doctor was deleted successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot delete Doctor with id=${id}. Maybe Doctor was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Could not delete Doctor with id=${id}`
    });
  }
};

// Get doctors by specialty
exports.findBySpecialty = async (req, res) => {
  const specialtyId = req.params.specialtyId;

  try {
    const doctors = await Doctor.findAll({
      where: { specialtyId: specialtyId },
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        }
      ]
    });
    
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Doctors with specialtyId=${specialtyId}`
    });
  }
};

// Get doctor by user id
exports.findByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const doctor = await Doctor.findOne({
      where: { userId: userId },
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: DoctorAvailability,
          attributes: ['id', 'dayOfWeek', 'startTime', 'endTime']
        },
        {
          model: DoctorAbsence,
          attributes: ['id', 'startDate', 'endDate', 'reason']
        }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with userId=${userId} was not found.`
      });
    }
    
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving Doctor with userId=${userId}`
    });
  }
};

// Get doctor availability
exports.getAvailability = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const availability = await DoctorAvailability.findAll({
      where: { doctorId: doctorId }
    });
    
    res.status(200).json(availability);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving availability for doctor with id=${doctorId}`
    });
  }
};

// Get doctor absences
exports.getAbsences = async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const absences = await DoctorAbsence.findAll({
      where: { doctorId: doctorId }
    });
    
    res.status(200).json(absences);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving absences for doctor with id=${doctorId}`
    });
  }
};

// Set doctor availability
exports.setAvailability = async (req, res) => {
  const doctorId = req.params.doctorId;
  const { dayOfWeek, startTime, endTime } = req.body;

  try {
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with id=${doctorId} was not found.`
      });
    }
    
    // Check if availability for this day already exists
    let availability = await DoctorAvailability.findOne({
      where: { doctorId, dayOfWeek }
    });
    
    if (availability) {
      // Update existing availability
      await availability.update({ startTime, endTime });
      
      res.status(200).json({
        message: 'Availability updated successfully!',
        availability
      });
    } else {
      // Create new availability
      availability = await DoctorAvailability.create({
        doctorId,
        dayOfWeek,
        startTime,
        endTime
      });
      
      res.status(201).json({
        message: 'Availability created successfully!',
        availability
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error setting availability for doctor with id=${doctorId}`
    });
  }
};

// Remove doctor availability
exports.removeAvailability = async (req, res) => {
  const doctorId = req.params.doctorId;
  const dayOfWeek = req.params.dayOfWeek;

  try {
    const num = await DoctorAvailability.destroy({
      where: { doctorId, dayOfWeek }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Availability was removed successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot remove availability. Maybe availability was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error removing availability for doctor with id=${doctorId}`
    });
  }
};

// Add doctor absence
exports.addAbsence = async (req, res) => {
  const doctorId = req.params.doctorId;
  const { startDate, endDate, reason } = req.body;

  try {
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with id=${doctorId} was not found.`
      });
    }
    
    // Create new absence
    const absence = await DoctorAbsence.create({
      doctorId,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({
      message: 'Absence added successfully!',
      absence
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error adding absence for doctor with id=${doctorId}`
    });
  }
};

// Remove doctor absence
exports.removeAbsence = async (req, res) => {
  const doctorId = req.params.doctorId;
  const absenceId = req.params.absenceId;

  try {
    const num = await DoctorAbsence.destroy({
      where: { id: absenceId, doctorId }
    });
    
    if (num == 1) {
      res.status(200).json({
        message: 'Absence was removed successfully!'
      });
    } else {
      res.status(404).json({
        message: `Cannot remove absence. Maybe absence was not found!`
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error removing absence for doctor with id=${doctorId}`
    });
  }
};

// Get available time slots for a doctor on a specific date
exports.getAvailableTimeSlots = async (req, res) => {
  const doctorId = req.params.doctorId;
  const date = req.params.date;

  try {
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with id=${doctorId} was not found.`
      });
    }
    
    // Convert date string to Date object
    const appointmentDate = new Date(date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
    
    // Check if doctor has availability for this day
    const dayAvailability = await DoctorAvailability.findOne({
      where: { doctorId, dayOfWeek }
    });
    
    if (!dayAvailability) {
      return res.status(200).json([]);  // Doctor doesn't work on this day
    }
    
    // Check if doctor has absence during this date
    const hasAbsence = await DoctorAbsence.findOne({
      where: { 
        doctorId,
        startDate: { [db.Sequelize.Op.lte]: date },
        endDate: { [db.Sequelize.Op.gte]: date }
      }
    });
    
    if (hasAbsence) {
      return res.status(200).json([]);  // Doctor is absent on this day
    }
    
    // Generate time slots based on availability (30 min intervals)
    const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
    const startMinute = parseInt(dayAvailability.startTime.split(':')[1]);
    const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
    const endMinute = parseInt(dayAvailability.endTime.split(':')[1]);
    
    const slots = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this time slot is already booked
      const isBooked = await Appointment.findOne({
        where: {
          doctorId,
          date,
          time: timeSlot,
          status: { [db.Sequelize.Op.in]: ['confirmed', 'pending'] }
        }
      });
      
      if (!isBooked) {
        slots.push(timeSlot);
      }
      
      // Advance by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({
      message: err.message || `Error retrieving available time slots for doctor with id=${doctorId}`
    });
  }
};
