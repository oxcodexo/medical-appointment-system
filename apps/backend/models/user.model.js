module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 100] // Minimum 8 characters
      }
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role: {
      type: Sequelize.ENUM('patient', 'responsable', 'doctor', 'admin'),
      allowNull: false,
      defaultValue: 'patient'
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
      // validate: {
      //   is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/i // Basic phone validation
      // }
    },
    address: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    },
    lastLogin: {
      type: Sequelize.DATE,
      allowNull: true
    },
    emailVerified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      }
    ]
  });

  // Instance methods
  User.prototype.toJSON = function() {
    const values = {...this.get()};
    delete values.password;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
  };

  return User;
};
