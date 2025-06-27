const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.doctor = require("./doctor.model.js")(sequelize, Sequelize);
db.specialty = require("./specialty.model.js")(sequelize, Sequelize);
db.appointment = require("./appointment.model.js")(sequelize, Sequelize);
db.doctorAvailability = require("./doctorAvailability.model.js")(sequelize, Sequelize);
db.doctorAbsence = require("./doctorAbsence.model.js")(sequelize, Sequelize);
db.medicalDossier = require("./medicalDossier.model.js")(sequelize, Sequelize);
db.medicalHistoryEntry = require("./medicalHistoryEntry.model.js")(sequelize, Sequelize);
db.userProfile = require("./userProfile.model.js")(sequelize, Sequelize);
db.review = require("./review.model.js")(sequelize, Sequelize);
db.doctorManager = require("./doctorManager.model.js")(sequelize, Sequelize);

// Security models
db.permission = require("./permission.model.js")(sequelize, Sequelize);
db.rolePermission = require("./rolePermission.model.js")(sequelize, Sequelize);
db.userPermission = require("./userPermission.model.js")(sequelize, Sequelize);

// Notification models
db.notification = require("./notification.model.js")(sequelize, Sequelize);
db.notificationTemplate = require("./notificationTemplate.model.js")(sequelize, Sequelize);

// Define relationships
// User-Doctor relationship (one-to-one)
db.user.hasOne(db.doctor, { foreignKey: 'userId', as: 'doctorProfile' });
db.doctor.belongsTo(db.user, { foreignKey: 'userId' });

// User-UserProfile relationship (one-to-one)
db.user.hasOne(db.userProfile, { foreignKey: 'userId', as: 'userProfile' });
db.userProfile.belongsTo(db.user, { foreignKey: 'userId' });

// Doctor-Specialty relationship (many-to-one)
db.specialty.hasMany(db.doctor, { foreignKey: 'specialtyId' });
db.doctor.belongsTo(db.specialty, { foreignKey: 'specialtyId' });

// Doctor-DoctorAvailability relationship (one-to-many)
db.doctor.hasMany(db.doctorAvailability, { foreignKey: 'doctorId' });
db.doctorAvailability.belongsTo(db.doctor, { foreignKey: 'doctorId' });

// Doctor-DoctorAbsence relationship (one-to-many)
db.doctor.hasMany(db.doctorAbsence, { foreignKey: 'doctorId' });
db.doctorAbsence.belongsTo(db.doctor, { foreignKey: 'doctorId' });

// Doctor-Appointment relationship (one-to-many)
db.doctor.hasMany(db.appointment, { foreignKey: 'doctorId' });
db.appointment.belongsTo(db.doctor, { foreignKey: 'doctorId' });

// User-Appointment relationship (one-to-many)
db.user.hasMany(db.appointment, { foreignKey: 'userId' });
db.appointment.belongsTo(db.user, { foreignKey: 'userId' });

// User-MedicalDossier relationship (one-to-one)
db.user.hasOne(db.medicalDossier, { foreignKey: 'patientId' });
db.medicalDossier.belongsTo(db.user, { foreignKey: 'patientId' });

// MedicalDossier-MedicalHistoryEntry relationship (one-to-many)
db.medicalDossier.hasMany(db.medicalHistoryEntry, { foreignKey: 'dossierId', as: 'history' });
db.medicalHistoryEntry.belongsTo(db.medicalDossier, { foreignKey: 'dossierId' });

// Appointment-MedicalHistoryEntry relationship (one-to-one)
db.appointment.hasOne(db.medicalHistoryEntry, { foreignKey: 'appointmentId' });
db.medicalHistoryEntry.belongsTo(db.appointment, { foreignKey: 'appointmentId' });

// Doctor-Review relationship (one-to-many)
db.doctor.hasMany(db.review, { foreignKey: 'doctorId', as: 'reviews' });
db.review.belongsTo(db.doctor, { foreignKey: 'doctorId' });

// User-Review relationship (one-to-many)
db.user.hasMany(db.review, { foreignKey: 'userId' });
db.review.belongsTo(db.user, { foreignKey: 'userId' });

// Appointment-Review relationship (one-to-one)
db.appointment.hasOne(db.review, { foreignKey: 'appointmentId' });
db.review.belongsTo(db.appointment, { foreignKey: 'appointmentId' });

// Doctor-Manager relationship (many-to-many through doctorManager)
db.doctor.belongsToMany(db.user, { 
  through: db.doctorManager,
  foreignKey: 'doctorId',
  otherKey: 'managerId',
  as: 'managers'
});

db.user.belongsToMany(db.doctor, {
  through: db.doctorManager,
  foreignKey: 'managerId',
  otherKey: 'doctorId',
  as: 'managedDoctors'
});

// Direct access to the join table
db.doctorManager.belongsTo(db.doctor, { foreignKey: 'doctorId' });
db.doctorManager.belongsTo(db.user, { foreignKey: 'managerId', as: 'manager' });
db.doctor.hasMany(db.doctorManager, { foreignKey: 'doctorId' });
db.user.hasMany(db.doctorManager, { foreignKey: 'managerId' });

// Security model relationships
db.permission.hasMany(db.rolePermission, { foreignKey: 'permissionId' });
db.rolePermission.belongsTo(db.permission, { foreignKey: 'permissionId' });

db.permission.hasMany(db.userPermission, { foreignKey: 'permissionId' });
db.userPermission.belongsTo(db.permission, { foreignKey: 'permissionId' });

db.user.hasMany(db.userPermission, { foreignKey: 'userId' });
db.userPermission.belongsTo(db.user, { foreignKey: 'userId' });

// Notification model relationships
db.user.hasMany(db.notification, { foreignKey: 'userId', as: 'notifications' });
db.notification.belongsTo(db.user, { foreignKey: 'userId' });

db.notificationTemplate.hasMany(db.notification, { foreignKey: 'templateId' });
db.notification.belongsTo(db.notificationTemplate, { foreignKey: 'templateId', allowNull: true });

// Add hooks for data validation and consistency

// Doctor validation hook
db.doctor.beforeCreate(async (doctor, options) => {
  // Ensure the userId exists and is valid
  if (!doctor.userId) {
    throw new Error('User ID is required for doctor profiles');
  }
  
  // Check if user exists and has the correct role
  const user = await db.user.findByPk(doctor.userId);
  if (!user) {
    throw new Error('Associated user not found');
  }
  
  if (user.role !== 'doctor') {
    throw new Error('Associated user must have a doctor role');
  }
});

// Add a method to get patient information regardless of booking type
db.appointment.prototype.getPatientInfo = async function() {
  if (this.isGuestBooking) {
    return {
      name: this.patientName,
      email: this.patientEmail,
      phone: this.patientPhone
    };
  } else if (this.userId) {
    const user = await db.user.findByPk(this.userId);
    if (!user) {
      throw new Error('Associated user not found');
    }
    return {
      name: user.name,
      email: user.email,
      phone: user.phone || ''
    };
  }
  throw new Error('Invalid appointment data');
};

module.exports = db;
