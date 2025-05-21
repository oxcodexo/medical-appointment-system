module.exports = (sequelize, Sequelize) => {
  const UserProfile = sequelize.define("userProfile", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: true
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    gender: {
      type: Sequelize.ENUM('male', 'female', 'other', 'prefer-not-to-say'),
      allowNull: true
    },
    emergencyContact: {
      type: Sequelize.STRING,
      allowNull: true
    },
    bloodType: {
      type: Sequelize.STRING,
      allowNull: true
    },
    allergies: {
      type: Sequelize.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('allergies');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('allergies', JSON.stringify(value));
      }
    },
    chronicConditions: {
      type: Sequelize.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('chronicConditions');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('chronicConditions', JSON.stringify(value));
      }
    }
  }, {
    timestamps: true
  });

  return UserProfile;
};
