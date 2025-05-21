module.exports = (sequelize, Sequelize) => {
  const DoctorAvailability = sequelize.define("doctorAvailability", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doctorId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    dayOfWeek: {
      type: Sequelize.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false
    },
    startTime: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    endTime: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }
  }, {
    timestamps: true
  });

  return DoctorAvailability;
};
