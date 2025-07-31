const sequelize = require('../config/database');

async function createTables() {
  try {
    console.log('🏗️  Creando tablas en orden correcto...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');
    
    // Crear tabla Users primero
    await sequelize.query(`
      IF OBJECT_ID('Users', 'U') IS NULL 
      CREATE TABLE [Users] (
        [UserID] INTEGER IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL,
        [Password] NVARCHAR(255) NOT NULL,
        [Email] NVARCHAR(100) NOT NULL,
        [FirstName] NVARCHAR(50) NOT NULL,
        [LastName] NVARCHAR(50) NOT NULL,
        [PhoneNumber] NVARCHAR(20) NULL,
        [BirthDate] DATE NOT NULL,
        [Gender] VARCHAR(1) CHECK ([Gender] IN('M', 'F')) NOT NULL,
        [BloodType] VARCHAR(3) CHECK ([BloodType] IN('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')) NOT NULL,
        [UserType] VARCHAR(10) CHECK ([UserType] IN('donor', 'receiver', 'admin')) NOT NULL,
        [IsActive] BIT DEFAULT 1,
        [CreatedAt] DATETIMEOFFSET DEFAULT GETDATE(),
        [LastLogin] DATETIMEOFFSET NULL
      );
    `);
    console.log('✅ Tabla Users creada.');
    
    // Crear tabla Hospitals
    await sequelize.query(`
      IF OBJECT_ID('Hospitals', 'U') IS NULL 
      CREATE TABLE [Hospitals] (
        [HospitalID] INTEGER IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(100) NOT NULL,
        [Address] NVARCHAR(200) NOT NULL,
        [City] NVARCHAR(50) NOT NULL,
        [State] NVARCHAR(50) NOT NULL,
        [PostalCode] NVARCHAR(10) NOT NULL,
        [PhoneNumber] NVARCHAR(20) NOT NULL,
        [Email] NVARCHAR(100) NOT NULL,
        [AdminUserID] INTEGER NOT NULL,
        [IsActive] BIT DEFAULT 1,
        [CreatedAt] DATETIMEOFFSET DEFAULT GETDATE(),
        FOREIGN KEY ([AdminUserID]) REFERENCES [Users] ([UserID])
      );
    `);
    console.log('✅ Tabla Hospitals creada.');
    
    // Crear tabla Donors
    await sequelize.query(`
      IF OBJECT_ID('Donors', 'U') IS NULL 
      CREATE TABLE [Donors] (
        [DonorID] INTEGER IDENTITY(1,1) PRIMARY KEY,
        [UserID] INTEGER NOT NULL,
        [LastDonationDate] DATETIMEOFFSET NULL,
        [CanDonateAfter] DATETIMEOFFSET NULL,
        [TotalDonations] INTEGER DEFAULT 0,
        [IsPublic] BIT DEFAULT 1,
        [DonorStory] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIMEOFFSET DEFAULT GETDATE(),
        FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID])
      );
    `);
    console.log('✅ Tabla Donors creada.');
    
    // Crear tabla Receivers
    await sequelize.query(`
      IF OBJECT_ID('Receivers', 'U') IS NULL 
      CREATE TABLE [Receivers] (
        [ReceiverID] INTEGER IDENTITY(1,1) PRIMARY KEY,
        [UserID] INTEGER NOT NULL,
        [HospitalID] INTEGER NOT NULL,
        [MedicalRecordNumber] NVARCHAR(50) NOT NULL,
        [Diagnosis] NVARCHAR(MAX) NOT NULL,
        [DoctorName] NVARCHAR(100) NOT NULL,
        [RequiredDonations] INTEGER NOT NULL DEFAULT 1,
        [CurrentDonations] INTEGER DEFAULT 0,
        [Deadline] DATETIMEOFFSET NOT NULL,
        [IsPublic] BIT DEFAULT 1,
        [Story] NVARCHAR(MAX) NULL,
        [Status] VARCHAR(10) CHECK ([Status] IN('active', 'completed', 'cancelled')) DEFAULT 'active',
        [CreatedAt] DATETIMEOFFSET DEFAULT GETDATE(),
        FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]),
        FOREIGN KEY ([HospitalID]) REFERENCES [Hospitals] ([HospitalID])
      );
    `);
    console.log('✅ Tabla Receivers creada.');
    
    // Crear tabla DonorReceiverAssignments
    await sequelize.query(`
      IF OBJECT_ID('DonorReceiverAssignments', 'U') IS NULL 
      CREATE TABLE [DonorReceiverAssignments] (
        [AssignmentID] INTEGER IDENTITY(1,1) PRIMARY KEY,
        [DonorID] INTEGER NOT NULL,
        [ReceiverID] INTEGER NOT NULL,
        [AssignmentDate] DATETIMEOFFSET DEFAULT GETDATE(),
        [Status] VARCHAR(10) CHECK ([Status] IN('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
        [DonationDate] DATETIMEOFFSET NULL,
        [HospitalID] INTEGER NOT NULL,
        [Notes] NVARCHAR(MAX) NULL,
        FOREIGN KEY ([DonorID]) REFERENCES [Donors] ([DonorID]),
        FOREIGN KEY ([ReceiverID]) REFERENCES [Receivers] ([ReceiverID]),
        FOREIGN KEY ([HospitalID]) REFERENCES [Hospitals] ([HospitalID])
      );
    `);
    console.log('✅ Tabla DonorReceiverAssignments creada.');
    
    // Agregar restricciones únicas después de crear las tablas
    console.log('🔒 Agregando restricciones únicas...');
    
    try {
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('Users'))
        CREATE UNIQUE INDEX IX_Users_Username ON [Users] ([Username]);
      `);
      console.log('✅ Índice único para Username creado.');
    } catch (error) {
      console.log('⚠️  No se pudo crear índice único para Username:', error.message);
    }
    
    try {
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('Users'))
        CREATE UNIQUE INDEX IX_Users_Email ON [Users] ([Email]);
      `);
      console.log('✅ Índice único para Email creado.');
    } catch (error) {
      console.log('⚠️  No se pudo crear índice único para Email:', error.message);
    }
    
    try {
      await sequelize.query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Receivers_MedicalRecordNumber' AND object_id = OBJECT_ID('Receivers'))
        CREATE UNIQUE INDEX IX_Receivers_MedicalRecordNumber ON [Receivers] ([MedicalRecordNumber]);
      `);
      console.log('✅ Índice único para MedicalRecordNumber creado.');
    } catch (error) {
      console.log('⚠️  No se pudo crear índice único para MedicalRecordNumber:', error.message);
    }
    
    console.log('🎉 Todas las tablas creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTables();
}

module.exports = createTables; 