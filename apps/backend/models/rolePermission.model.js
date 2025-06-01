module.exports = (sequelize, Sequelize) => {
  const RolePermission = sequelize.define("rolePermission", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: {
      type: Sequelize.ENUM('patient', 'responsable', 'doctor', 'admin'),
      allowNull: false
    },
    permissionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    grantedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    grantedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['role', 'permissionId']
      }
    ]
  });

  return RolePermission;
};
