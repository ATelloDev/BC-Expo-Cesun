const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonorReceiverAssignment = sequelize.define('DonorReceiverAssignment', {
  AssignmentID: {
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
    allowNull: false,
    references: {
      model: 'Receivers',
      key: 'ReceiverID'
    }
  },
  AssignmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  Status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  DonationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  HospitalID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Hospitals',
      key: 'HospitalID'
    }
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'DonorReceiverAssignments',
  timestamps: false
});

module.exports = DonorReceiverAssignment; 