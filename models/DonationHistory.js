const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonationHistory = sequelize.define('DonationHistory', {
  HistoryID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  DonorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Donors',
      key: 'DonorID'
    }
  },
  ReceiverID: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser null si es donación general
    references: {
      model: 'Receivers',
      key: 'ReceiverID'
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
  DonationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  BloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  Amount: {
    type: DataTypes.DECIMAL(5, 2), // Cantidad en ml
    allowNull: false,
    defaultValue: 450.00 // Cantidad estándar de donación
  },
  Status: {
    type: DataTypes.ENUM('completed', 'cancelled', 'pending'),
    allowNull: false,
    defaultValue: 'completed'
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DonationHistory',
  timestamps: false
});

module.exports = DonationHistory; 