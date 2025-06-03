const { AppointmentStatus } = require('@medical-appointment-system/shared-types');
const db = require('../models');
const Appointment = db.appointment;
const Doctor = db.doctor;
const User = db.user;
const Specialty = db.specialty;
const Notification = db.notification;
const NotificationTemplate = db.notificationTemplate;
const Sequelize = require('sequelize');
const { Op } = Sequelize;

// Helper function to send appointment notifications
async function sendAppointmentNotification(appointmentId, type, userId, doctorId) {
  try {
    // Get appointment details with related data
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Doctor,
          include: [{ model: Specialty, attributes: ['name'] }]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!appointment) return;

    // Find notification template
    const templateName = `appointment_${type}`;
    const template = await NotificationTemplate.findOne({
      where: { name: templateName, isActive: true }
    });

    if (!template) return;

    // Create variables for template
    const variables = {
      patientName: appointment.User.name,
      doctorName: appointment.Doctor.name,
      specialtyName: appointment.Doctor.Specialty ? appointment.Doctor.Specialty.name : 'Specialist',
      appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
      appointmentTime: new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: appointment.status,
      notes: appointment.notes || 'No additional notes',
      reason: appointment.reason || 'Medical consultation'
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

    // Create notifications for both patient and doctor if needed
    const notifications = [];

    // Always notify the patient
    if (userId) {
      notifications.push({
        userId,
        type: `appointment_${type}`,
        title,
        content,
        isRead: false,
        priority: type === 'canceled' ? 'high' : 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: template.id,
        metadata: { appointmentId }
      });
    }

    // Notify doctor for new appointments and cancellations
    if (doctorId && (type === 'created' || type === 'canceled')) {
      notifications.push({
        userId: doctorId,
        type: `appointment_${type}_doctor`,
        title: title.replace('Your appointment', 'New appointment'),
        content: content.replace('Your appointment', 'An appointment'),
        isRead: false,
        priority: type === 'canceled' ? 'high' : 'normal',
        channel: 'in-app',
        deliveryStatus: 'delivered',
        templateId: template.id,
        metadata: { appointmentId }
      });
    }

    // Create all notifications
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    // Don't throw the error to prevent affecting the main operation
  }
}

// Get all appointments with filtering and pagination
exports.findAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      doctorId,
      userId,
      sortBy = 'date',
      sortOrder = 'DESC'
    } = req.query;

    // Check permissions - non-admins can only see their own appointments
    let userFilter = {};
    if (req.userRole !== 'admin') {
      // If user is a doctor, they can see their appointments
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      if (doctor) {
        userFilter = {
          [Op.or]: [
            { userId: req.userId },
            { doctorId: doctor.id }
          ]
        };
      } else {
        // Regular users can only see their own appointments
        userFilter = { userId: req.userId };
      }
    } else if (userId) {
      // Admin with userId filter
      userFilter = { userId };
    }

    // Build filter conditions
    const whereConditions = { ...userFilter };
    
    // Add status filter if provided
    if (status) {
      whereConditions.status = status;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      whereConditions.date = {};
      if (startDate) {
        whereConditions.date[Op.gte] = startDate;
      }
      if (endDate) {
        whereConditions.date[Op.lte] = endDate;
      }
    }
    
    // Add doctor filter if provided
    if (doctorId) {
      whereConditions.doctorId = doctorId;
    }

    // Validate sort parameters
    const validSortFields = ['date', 'time', 'createdAt', 'status'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
    const actualSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Calculate pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10);

    // Get appointments with pagination
    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Doctor,
          include: [
            {
              model: Specialty,
              attributes: ['id', 'name']
            },
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [
        [actualSortBy, actualSortOrder],
        // Add secondary sort by time if sorting by date
        ...(actualSortBy === 'date' ? [['time', actualSortOrder]] : [])
      ],
      limit: parsedLimit,
      offset: offset
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / parsedLimit);
    const currentPage = parseInt(page, 10);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      appointments,
      pagination: {
        total: count,
        totalPages,
        currentPage,
        limit: parsedLimit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error('Error retrieving appointments:', err);
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
    const { doctorId, date, time, reason, userId, patientName, patientEmail, patientPhone, isGuestBooking, notes, duration } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        message: 'Required fields missing: doctorId, date, time, and reason are required.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: 'Invalid date format. Date must be in YYYY-MM-DD format.'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        message: 'Invalid time format. Time must be in HH:MM format.'
      });
    }

    // Validate doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        message: `Doctor with id=${doctorId} not found.`
      });
    }

    // Check if user exists if userId is provided
    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          message: `User with id=${userId} not found.`
        });
      }
    }

    // For guest bookings, validate required guest fields
    if (isGuestBooking) {
      if (!patientName || !patientEmail || !patientPhone) {
        return res.status(400).json({
          message: 'Guest bookings require patientName, patientEmail, and patientPhone.'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientEmail)) {
        return res.status(400).json({
          message: 'Invalid email format.'
        });
      }

      // Validate phone format
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(patientPhone)) {
        return res.status(400).json({
          message: 'Invalid phone number format.'
        });
      }
    } else if (!userId) {
      // If not a guest booking and no userId, return error
      return res.status(400).json({
        message: 'Either userId or guest booking information must be provided.'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        date,
        time,
        status: {
          [Op.notIn]: ['canceled', 'rejected', 'no-show']
        }
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        message: 'There is already an appointment scheduled at this time.'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      date,
      time,
      reason,
      userId: userId || null,
      patientName: patientName || null,
      patientEmail: patientEmail || null,
      patientPhone: patientPhone || null,
      isGuestBooking: !!isGuestBooking,
      status: 'pending',
      notes: notes || null,
      duration: duration || 30
    });

    // Send notification for new appointment
    await sendAppointmentNotification(
      appointment.id,
      'created',
      userId,
      doctorId
    );

    res.status(201).json({
      message: 'Appointment created successfully!',
      appointment
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({
      message: err.message || 'Some error occurred while creating the appointment.'
    });
  }
};

// Update appointment status
exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { status, notes } = req.body;

  try {
    // Get appointment with related data for notifications
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { 
          model: Doctor, 
          attributes: ['id', 'userId'],
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        }
      ]
    });
    
    if (!appointment)
      return res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });

    // Prevent certain status transitions
    if (appointment.status === AppointmentStatus.COMPLETED && status !== AppointmentStatus.COMPLETED)
      return res.status(400).json({
        message: "Impossible de changer le statut d'un rendez-vous terminé."
      });

    if (appointment.status === AppointmentStatus.CANCELED && status !== AppointmentStatus.CANCELED)
      return res.status(400).json({
        message: "Impossible de changer le statut d'un rendez-vous annulé."
      });

    // Store the previous status for notification purposes
    const previousStatus = appointment.status;
    
    // Update status and notes if provided
    appointment.status = status;
    if (notes !== undefined)
      appointment.notes = notes;

    await appointment.save();

    // // Send notification based on status change
    // await sendAppointmentNotification(
    //   appointment.id,
    //   status,  // notification type based on new status
    //   appointment.userId,
    //   appointment.doctorId
    // );
    
    res.status(200).json(appointment);
  } catch (err) {
    console.error(`Error updating status for Appointment with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error updating status for Appointment with id=${id}`
    });
  }
};

// restore canceled appointment by changing its status to pending
exports.restore = async (req, res) => {
  const id = req.params.id;

  try {
   // Get appointment with related data
   const appointment = await Appointment.findByPk(id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { 
        model: Doctor, 
        attributes: ['id', 'userId'],
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      }
    ]
  });
    
    if (!appointment) 
     return  res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });
    
    // Update status to pending
    appointment.status = 'pending';
    await appointment.save();
    
    res.status(200).json(appointment);
  } catch (err) {
    console.error(`Error restoring Appointment with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error restoring Appointment with id=${id}`
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

// Cancel appointment
exports.cancel = async (req, res) => {
  const id = req.params.id;
  const { reason } = req.body;

  try {
    // Get appointment with related data for notifications
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { 
          model: Doctor, 
          attributes: ['id', 'userId'],
          include: [{ model: User, attributes: ['id', 'name', 'email'] }]
        }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({
        message: `Appointment with id=${id} was not found.`
      });
    }

    // Store the previous status for notification purposes
    const previousStatus = appointment.status;
    
    // Update status to canceled
    appointment.status = 'canceled';
    if (reason) 
      appointment.notes = appointment.notes ? `${appointment.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
    
    await appointment.save();
    
    // // Send notification for canceled appointment
    // await sendAppointmentNotification(
    //   appointment.id,
    //   'canceled',
    //   appointment.userId,
    //   appointment.doctorId
    // );
    
    res.status(200).json(appointment);
  } catch (err) {
    console.error(`Error canceling Appointment with id=${id}:`, err);
    res.status(500).json({
      message: err.message || `Error canceling Appointment with id=${id}`
    });
  }
};

// Get appointments for user
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Check permissions - users can only see their own appointments unless they have permission
    if (
      parseInt(userId) !== req.userId && 
      req.userRole !== 'admin' && 
      !req.permissions?.some(p => p.name === 'appointment:view_all')
    ) {
      return res.status(403).json({
        message: 'You do not have permission to view this user\'s appointments.'
      });
    }

    const appointments = await Appointment.findAll({
      where: { userId: userId },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: Specialty,
              attributes: ['id', 'name']
            },
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error retrieving appointments for user:', err);
    res.status(500).json({
      message: err.message || `Error retrieving Appointments for user with id=${userId}`,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      details: err.toString()
    });
  }
};