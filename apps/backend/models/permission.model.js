module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define("permission", {
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
    description: {
      type: Sequelize.TEXT,
      allowNull: true
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
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Permission;
};
