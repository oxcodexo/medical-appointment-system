module.exports = (sequelize, Sequelize) => {
  const Specialty = sequelize.define("specialty", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true
  });

  return Specialty;
};
