const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receiver = sequelize.define('Receiver', {
  ReceiverID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'UserID'
    }
  },
  HospitalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Hospitals',
      key: 'HospitalID'
    }
  },
  MedicalRecordNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  DoctorName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  RequiredDonations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  CurrentDonations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  Deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  IsPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  Story: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active'
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Receivers',
  timestamps: false
});

module.exports = Receiver; 