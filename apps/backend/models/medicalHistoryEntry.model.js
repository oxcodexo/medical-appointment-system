module.exports = (sequelize, Sequelize) => {
  const MedicalHistoryEntry = sequelize.define("medicalHistoryEntry", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dossierId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    appointmentId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    doctorId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    doctorName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    diagnosis: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    treatment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    prescriptions: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return MedicalHistoryEntry;
};
