module.exports = (sequelize, Sequelize) => {
  const Appointment = sequelize.define("appointment", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doctorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    // For guest patients (not registered users)
    patientName: {
      type: Sequelize.STRING(100),
      allowNull: true, // Can be null if userId is provided
      validate: {
        notEmpty: true
      }
    },
    patientEmail: {
      type: Sequelize.STRING(100),
      allowNull: true, // Can be null if userId is provided
      validate: {
        isEmail: true
      }
    },
    patientPhone: {
      type: Sequelize.STRING(20),
      allowNull: true, // Can be null if userId is provided
      validate: {
        is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/i
      }
    },
    // Flag to indicate if this is a guest booking
    isGuestBooking: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString().split('T')[0] // Must be after today
      }
    },
    time: {
      type: Sequelize.STRING(8),
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/i // HH:MM format
      }
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30, // Duration in minutes
      validate: {
        min: 15,
        max: 180
      }
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'canceled', 'completed', 'no-show'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true, // Can be null for guest bookings
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    followUpNeeded: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    followUpDate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    reminderSent: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    cancelReason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    canceledBy: {
      type: Sequelize.ENUM('patient', 'doctor', 'system'),
      allowNull: true
    },
    insuranceInfo: {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Appointment;
};
