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

// Define relationships
// User-Doctor relationship (one-to-one)
db.user.hasOne(db.doctor, { foreignKey: 'userId' });
db.doctor.belongsTo(db.user, { foreignKey: 'userId' });

// User-UserProfile relationship (one-to-one)
db.user.hasOne(db.userProfile, { foreignKey: 'userId' });
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

module.exports = db;
