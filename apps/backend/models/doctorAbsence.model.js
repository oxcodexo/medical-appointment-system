module.exports = (sequelize, Sequelize) => {
  const DoctorAbsence = sequelize.define("doctorAbsence", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doctorId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    startDate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return DoctorAbsence;
};
