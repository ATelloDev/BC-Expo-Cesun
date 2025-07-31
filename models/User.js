const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  FirstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  LastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  PhoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  BirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  Gender: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: false
  },
  BloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  UserType: {
    type: DataTypes.ENUM('donor', 'receiver', 'admin'),
    allowNull: false
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  LastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.Password) {
        user.Password = await bcrypt.hash(user.Password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('Password')) {
        user.Password = await bcrypt.hash(user.Password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.Password);
};

module.exports = User; 