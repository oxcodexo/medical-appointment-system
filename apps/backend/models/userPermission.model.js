module.exports = (sequelize, Sequelize) => {
  const UserPermission = sequelize.define("userPermission", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    permissionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    isGranted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'True means permission is granted, false means explicitly denied'
    },
    resourceType: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Optional resource type this permission applies to (e.g., "appointment")'
    },
    resourceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Optional specific resource ID this permission applies to'
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Optional expiration date for temporary permissions'
    },
    grantedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reason: {
      type: Sequelize.STRING(255),
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['permissionId']
      },
      {
        fields: ['resourceType', 'resourceId']
      },
      {
        fields: ['expiresAt']
      }
    ]
  });

  return UserPermission;
};
