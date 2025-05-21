module.exports = (sequelize, Sequelize) => {
  const MedicalDossier = sequelize.define("medicalDossier", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patientId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    patientName: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return MedicalDossier;
};
