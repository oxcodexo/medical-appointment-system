module.exports = (sequelize, Sequelize) => {
  const DoctorManager = sequelize.define("doctorManager", {
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
    managerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isPrimary: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    canEditSchedule: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    canManageAppointments: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['doctorId']
      },
      {
        fields: ['managerId']
      },
      {
        unique: true,
        fields: ['doctorId', 'managerId']
      }
    ]
  });

  return DoctorManager;
};
