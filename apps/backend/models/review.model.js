module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define("review", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    doctorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      }
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    appointmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    comment: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    visitDate: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    isAnonymous: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    helpfulCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    doctorResponse: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    doctorResponseDate: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['doctorId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['appointmentId']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Review;
};
