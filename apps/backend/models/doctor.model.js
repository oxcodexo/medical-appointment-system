module.exports = (sequelize, Sequelize) => {
  const Doctor = sequelize.define("doctor", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    specialtyId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '/placeholder.svg'
    },
    bio: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    experience: {
      type: Sequelize.STRING,
      allowNull: true
    },
    rating: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true
    }
  }, {
    timestamps: true
  });

  return Doctor;
};
