module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("notification", {
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
    type: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Type of notification (e.g., appointment_reminder, system_alert, message)'
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isRead: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    readAt: {
      type: Sequelize.DATE,
      allowNull: true
    },
    priority: {
      type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    channel: {
      type: Sequelize.ENUM('email', 'sms', 'in-app', 'push'),
      allowNull: false,
      defaultValue: 'in-app'
    },
    deliveryStatus: {
      type: Sequelize.ENUM('pending', 'sent', 'delivered', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    scheduledFor: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the notification should be sent (for scheduled notifications)'
    },
    expiresAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the notification should expire and no longer be shown'
    },
    relatedEntityType: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Type of entity this notification is related to (e.g., appointment, message)'
    },
    relatedEntityId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID of the related entity'
    },
    actionUrl: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'URL or deep link for the user to take action'
    },
    metadata: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional JSON data related to the notification',
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : {};
      },
      set(val) {
        this.setDataValue('metadata', JSON.stringify(val));
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['isRead']
      },
      {
        fields: ['deliveryStatus']
      },
      {
        fields: ['scheduledFor']
      },
      {
        fields: ['relatedEntityType', 'relatedEntityId']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Notification;
};
