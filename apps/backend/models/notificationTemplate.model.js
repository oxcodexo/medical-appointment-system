module.exports = (sequelize, Sequelize) => {
  const NotificationTemplate = sequelize.define("notificationTemplate", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    type: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    titleTemplate: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Template for notification title with placeholders like {{variable}}'
    },
    contentTemplate: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: 'Template for notification content with placeholders'
    },
    defaultPriority: {
      type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    availableChannels: {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'in-app',
      comment: 'Comma-separated list of channels this template can be sent through',
      get() {
        const value = this.getDataValue('availableChannels');
        return value ? value.split(',') : [];
      },
      set(val) {
        this.setDataValue('availableChannels', Array.isArray(val) ? val.join(',') : val);
      }
    },
    category: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'general'
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    requiredVariables: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Comma-separated list of variables required for this template',
      get() {
        const value = this.getDataValue('requiredVariables');
        return value ? value.split(',') : [];
      },
      set(val) {
        this.setDataValue('requiredVariables', Array.isArray(val) ? val.join(',') : val);
      }
    },
    defaultActionUrl: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Default URL template for action button/link'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  return NotificationTemplate;
};
