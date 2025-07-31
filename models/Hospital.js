const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
  HospitalID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  City: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  State: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  PostalCode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  PhoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  AdminUserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'UserID'
    }
  },
  IsActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Hospitals',
  timestamps: false
});

module.exports = Hospital; 