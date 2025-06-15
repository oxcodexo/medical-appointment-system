module.exports = (sequelize, Sequelize) => {
  const Doctor = sequelize.define("doctor", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    specialtyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'specialties',
        key: 'id'
      }
    },
    image: {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '/placeholder.svg'
    },
    bio: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    experience: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    yearsOfExperience: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 70
      }
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
    reviewCount: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    officeAddress: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    officeHours: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    acceptingNewPatients: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    languages: {
      type: Sequelize.STRING(255),
      allowNull: true,
      get() {
        const value = this.getDataValue('languages');
        return value ? value.split(',') : [];
      },
      // Accept both arrays and strings for robustness
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue('languages', val.join(','));
        } else if (typeof val === 'string') {
          this.setDataValue('languages', val);
        } else {
          this.setDataValue('languages', '');
        }
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return Doctor;
};
