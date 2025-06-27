const db = require('../models');
const Doctor = db.doctor;
const Specialty = db.specialty;
const DoctorAvailability = db.doctorAvailability;
const DoctorAbsence = db.doctorAbsence;
const User = db.user;
const Appointment = db.appointment;
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const { Op } = db.Sequelize;

// Helper function to send doctor-related notifications
async function sendDoctorNotification(doctorId, type, affectedUserId = null, metadata = {}) {
  try {
    // Get doctor details with user information
    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    if (!doctor || !doctor.User) return;

    // Find notification template
    const templateName = `doctor_${type}`;
    const template = await NotificationTemplate.findOne({
      where: { name: templateName, isActive: true }
    });

    if (!template) return;

    // Create variables for template
    const variables = {
      doctorName: doctor.name,
      specialtyName: doctor.specialtyName || 'Specialist',
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

    // Create notifications
    const notifications = [];

    // Notify the doctor
    notifications.push({
      userId: doctor.userId,
      type: `doctor_${type}`,
      title,
      content,
      isRead: false,
      priority: type === 'absence_approved' ? 'high' : 'normal',
      channel: 'in-app',
      deliveryStatus: 'delivered',
      templateId: template.id,
      metadata: { doctorId }
    });

    // Notify affected user if provided
    if (affectedUserId) {
      notifications.push({
        userId: affectedUserId,
        type: `doctor_${type}_affected`,
        title: title.replace('Your schedule', 'Doctor schedule'),
        content: content.replace('Your', 'Doctor'),
        isRead: false,
        priority: 'high',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: template.id,
        metadata: { doctorId }
      });
    }

    // Create all notifications
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  } catch (error) {
    console.error('Error sending doctor notification:', error);
    // Don't throw the error to prevent affecting the main operation
  }
}

// Helper function to notify patients about doctor absence
async function notifyPatientsAboutAbsence(doctorId, startDate, endDate, reason) {
  try {
    // Find all affected appointments
    const affectedAppointments = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: {
          [Op.in]: ['confirmed', 'pending']
        }
      },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    if (affectedAppointments.length === 0) return;

    // Get doctor details
    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ model: Specialty, attributes: ['name'] }]
    });

    if (!doctor) return;

    // Find notification template
    const template = await NotificationTemplate.findOne({
      where: { name: 'doctor_absence_patient_notification', isActive: true }
    });

    if (!template) return;

    // Create notifications for each affected patient
    const notifications = affectedAppointments.map(appointment => {
      // Create variables for template
      const variables = {
        patientName: appointment.User.name,
        doctorName: doctor.name,
        specialtyName: doctor.Specialty ? doctor.Specialty.name : 'Specialist',
        appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
        appointmentTime: new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        absenceStartDate: new Date(startDate).toLocaleDateString(),
        absenceEndDate: new Date(endDate).toLocaleDateString(),
        absenceReason: reason || 'Unavailability'
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

      return {
        userId: appointment.userId,
        type: 'doctor_absence_notification',
        title,
        content,
        isRead: false,
        priority: 'high',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: template.id,
        metadata: { 
          appointmentId: appointment.id,
          doctorId: doctor.id,
          absenceStartDate: startDate,
          absenceEndDate: endDate
        }
      };
    });

    // Create all notifications
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }

    return notifications.length;
  } catch (error) {
    console.error('Error notifying patients about doctor absence:', error);
    return 0;
  }
}

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
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'address', 'status']
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
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'address', 'status']
        },
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
        },
        {
          model: Appointment,
          as: 'appointments',
          attributes: ['id', 'date', 'time', 'status'],
          limit: 10,
          order: [['date', 'DESC'], ['time', 'DESC']]
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
    console.error('Error retrieving doctor:', err);
    res.status(500).json({
      message: err.message || `Error retrieving Doctor with id=${id}`
    });
  }
};

// Create a new doctor
exports.create = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'specialtyId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(req.body.specialtyId);
    if (!specialty) {
      return res.status(404).json({
        message: `Specialty with id=${req.body.specialtyId} not found.`
      });
    }

    // Check if user exists
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      return res.status(404).json({
        message: `User with id=${req.body.userId} not found.`
      });
    }

    // Check if user is already a doctor
    const existingDoctor = await Doctor.findOne({
      where: { userId: req.body.userId }
    });
    
    if (existingDoctor) {
      return res.status(400).json({
        message: `User with id=${req.body.userId} is already a doctor.`
      });
    }

    // Create doctor with audit information
    const doctor = await Doctor.create({
      name: req.body.name,
      specialtyId: req.body.specialtyId,
      userId: req.body.userId,
      licenseNumber: req.body.licenseNumber,
      bio: req.body.bio || '',
      education: req.body.education || '',
      experience: req.body.experience || '',
      specialtyName: specialty.name, // Store specialty name for easier access
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdBy: req.userId,
      metadata: req.body.metadata || {}
    });

    // Update user role to doctor if not already
    if (user.role !== 'doctor') {
      await user.update({ role: 'doctor' });
    }

    // Send notification to the new doctor
    await sendDoctorNotification(
      doctor.id,
      'registration',
      null,
      { specialtyName: specialty.name }
    );
    
    res.status(201).json({
      message: 'Doctor created successfully!',
      doctor
    });
  } catch (err) {
    console.error('Error creating doctor:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the Doctor.'
    });
  }
};

// Update a doctor
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // Check if doctor exists
    const doctor = await Doctor.findByPk(id); 
    
    if (!doctor)
      return res.status(404).json({
        message: `Doctor with id=${id} was not found.`
      });

    const { specialtyId, experience, bio } = req.body;

    // Update doctor
    await doctor.update({
      specialtyId,
      experience,
      bio,
    });

    const { name, email, phone } = req.body.user;

    // get the user by userid in the doctor
    const user = await User.findByPk(doctor.userId);

    // Update user
    await user.update({
      name,
      email,
      phone,
    });

    // Fetch the updated doctor with associations to return in response
    const updatedDoctor = await Doctor.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'address', 'status']
        },
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
      ]
    });

    res.status(200).json(updatedDoctor);
  } catch (err) {
    console.error(`Error updating Doctor with id=${id}:`, err);
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
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'status']
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
    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required.'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid date format. Please use YYYY-MM-DD format.'
      });
    }

    if (end < start) {
      return res.status(400).json({
        message: 'End date cannot be before start date.'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    
    if (!doctor)
      return res.status(404).json({
        message: `Doctor with id=${doctorId} was not found.`
      });

    // Check for overlapping absences
    const overlappingAbsence = await DoctorAbsence.findOne({
      where: {
        doctorId,
        [Op.or]: [
          { 
            startDate: { [Op.between]: [start, end] } 
          },
          { 
            endDate: { [Op.between]: [start, end] } 
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: start } },
              { endDate: { [Op.gte]: end } }
            ]
          }
        ]
      }
    });

    if (overlappingAbsence)
      return res.status(409).json({
        message: 'There is already an absence record that overlaps with the specified dates.'
      });

    // Create new absence with audit information
    const absence = await DoctorAbsence.create({
      doctorId,
      startDate: start,
      endDate: end,
      reason: reason || 'Personal',
      status: req.userRole === 'admin' ? 'approved' : 'pending',
      createdBy: req.userId,
      metadata: {
        requestedBy: req.userId,
        requestedAt: now
      }
    });

    res.status(201).json({
      message: 'Absence added successfully!',
      absence,
    });
  } catch (err) {
    console.error(`Error adding absence for doctor with id=${doctorId}:`, err);
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
    // Check if absence exists
    const absence = await DoctorAbsence.findOne({
      where: { id: absenceId, doctorId }
    });

    if (!absence) 
      return res.status(404).json({
        message: `Absence with id=${absenceId} for doctor with id=${doctorId} was not found.`
      });

    // Delete the absence
    await absence.destroy();

    res.status(200).json({
      message: 'Absence was removed successfully!',
    });
  } catch (err) {
    console.error(`Error removing absence for doctor with id=${doctorId}:`, err);
    res.status(500).json({
      message: err.message || `Error removing absence for doctor with id=${doctorId}`
    });
  }
};

// Update absence status (approve/reject)
exports.updateAbsenceStatus = async (req, res) => {
  const doctorId = req.params.doctorId;
  const absenceId = req.params.absenceId;
  const { status, notes } = req.body;

  try {
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either approved or rejected.'
      });
    }

    // Check if absence exists
    const absence = await DoctorAbsence.findOne({
      where: { id: absenceId, doctorId }
    });

    if (!absence) 
      return res.status(404).json({
        message: `Absence with id=${absenceId} for doctor with id=${doctorId} was not found.`
      });

    // Check if absence is already in the requested status
    if (absence.status === status) 
      return res.status(400).json({
        message: `Absence is already ${status}.`
      });

    // Check permissions (only admin can approve/reject)
    if (req.userRole !== 'admin' && !req.userPermissions.some(p => p.name === 'doctor:approve_absences')) {
      return res.status(403).json({
        message: 'You do not have permission to approve or reject absences.'
      });
    }

    // Update absence status
    absence.status = status;
    absence.reviewedBy = req.userId;
    absence.reviewedAt = new Date();
    
    if (notes) {
      absence.notes = notes;
    }

    // Add to metadata
    absence.metadata = absence.metadata || {};
    absence.metadata.statusHistory = absence.metadata.statusHistory || [];
    absence.metadata.statusHistory.push({
      from: absence.status,
      to: status,
      changedBy: req.userId,
      changedAt: new Date(),
      notes: notes || ''
    });

    await absence.save();

    // If approved, check for affected appointments and notify patients
    if (status === 'approved') {
      const notifiedCount = await notifyPatientsAboutAbsence(
        doctorId,
        absence.startDate,
        absence.endDate,
        absence.reason || 'Doctor unavailability'
      );

      // Add notification count to metadata
      absence.metadata.notifiedPatients = notifiedCount;
      await absence.save();
    }

    // Notify the doctor
    await sendDoctorNotification(
      doctorId,
      status === 'approved' ? 'absence_approved' : 'absence_rejected',
      null,
      { 
        startDate: absence.startDate.toLocaleDateString(),
        endDate: absence.endDate.toLocaleDateString(),
        reason: absence.reason,
        notes: notes || ''
      }
    );

    res.status(200).json({
      message: `Absence ${status} successfully!`,
      absence
    });
  } catch (err) {
    console.error(`Error updating absence status for doctor with id=${doctorId}:`, err);
    res.status(500).json({
      message: err.message || `Error updating absence status for doctor with id=${doctorId}`
    });
  }
};

// Get doctors managed by a specific user (manager/responsable)
exports.findManagedByUser = async (req, res) => {
  const managerId = req.params.userId;

  try {
    // Find all doctors managed by this user
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'managers',
          attributes: ['id', 'name', 'email'],
          through: {
            model: db.doctorManager,
            attributes: ['isPrimary', 'canEditSchedule', 'canManageAppointments'],
            where: { managerId: managerId }
          }
        }
      ],
      where: {
        '$managers.id$': managerId // Ensure only doctors managed by this specific manager are retrieved
      }
    });
    
    res.status(200).json(doctors);
  } catch (err) {
    console.error('Error retrieving doctors managed by user:', err);
    res.status(500).json({
      message: err.message || `Error retrieving doctors managed by user with id=${managerId}`,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      details: err.toString()
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
