const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'BloodDonationDB',
  host: 'DESKTOP-1IT6RHR',
  dialect: 'mssql',
  port: 1433,
  username: 'sa',
  password: 'NuevaClave123!',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 60000,
      connectionTimeout: 60000
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  logging: false,
  retry: {
    max: 3
  }
});

module.exports = sequelize;