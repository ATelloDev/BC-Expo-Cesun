const User = require('./User');
const Hospital = require('./Hospital');
const Donor = require('./Donor');
const Receiver = require('./Receiver');
const DonorReceiverAssignment = require('./DonorReceiverAssignment');
const DonationHistory = require('./DonationHistory');

// Relaciones User - Hospital (Admin)
User.hasOne(Hospital, { foreignKey: 'AdminUserID', as: 'AdministeredHospital' });
Hospital.belongsTo(User, { foreignKey: 'AdminUserID', as: 'Admin' });

// Relaciones User - Donor
User.hasOne(Donor, { foreignKey: 'UserID', as: 'DonorProfile' });
Donor.belongsTo(User, { foreignKey: 'UserID', as: 'User' });

// Relaciones User - Receiver
User.hasOne(Receiver, { foreignKey: 'UserID', as: 'ReceiverProfile' });
Receiver.belongsTo(User, { foreignKey: 'UserID', as: 'User' });

// Relaciones Hospital - Receiver
Hospital.hasMany(Receiver, { foreignKey: 'HospitalID', as: 'Receivers' });
Receiver.belongsTo(Hospital, { foreignKey: 'HospitalID', as: 'Hospital' });

// Relaciones Donor - DonorReceiverAssignment
Donor.hasMany(DonorReceiverAssignment, { foreignKey: 'DonorID', as: 'Assignments' });
DonorReceiverAssignment.belongsTo(Donor, { foreignKey: 'DonorID', as: 'Donor' });

// Relaciones Receiver - DonorReceiverAssignment
Receiver.hasMany(DonorReceiverAssignment, { foreignKey: 'ReceiverID', as: 'Assignments' });
DonorReceiverAssignment.belongsTo(Receiver, { foreignKey: 'ReceiverID', as: 'Receiver' });

// Relaciones Hospital - DonorReceiverAssignment
Hospital.hasMany(DonorReceiverAssignment, { foreignKey: 'HospitalID', as: 'DonationAssignments' });
DonorReceiverAssignment.belongsTo(Hospital, { foreignKey: 'HospitalID', as: 'Hospital' });

// Relaciones Donor - DonationHistory
Donor.hasMany(DonationHistory, { foreignKey: 'DonorID', as: 'DonationHistory' });
DonationHistory.belongsTo(Donor, { foreignKey: 'DonorID', as: 'Donor' });

// Relaciones Receiver - DonationHistory
Receiver.hasMany(DonationHistory, { foreignKey: 'ReceiverID', as: 'DonationHistory' });
DonationHistory.belongsTo(Receiver, { foreignKey: 'ReceiverID', as: 'Receiver' });

// Relaciones Hospital - DonationHistory
Hospital.hasMany(DonationHistory, { foreignKey: 'HospitalID', as: 'DonationHistory' });
DonationHistory.belongsTo(Hospital, { foreignKey: 'HospitalID', as: 'Hospital' });

module.exports = {
  User,
  Hospital,
  Donor,
  Receiver,
  DonorReceiverAssignment,
  DonationHistory
}; 