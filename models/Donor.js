const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donor = sequelize.define('Donor', {
  DonorID: {
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
  LastDonationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  CanDonateAfter: {
    type: DataTypes.DATE,
    allowNull: true
  },
  TotalDonations: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  IsPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  DonorStory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Donors',
  timestamps: false
});

module.exports = Donor; 