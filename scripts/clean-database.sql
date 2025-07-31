-- Script para limpiar y recrear la base de datos BloodDonationDB
-- Ejecutar este script en SQL Server Management Studio o en la línea de comandos

USE BloodDonationDB;
GO

-- Deshabilitar las restricciones de clave foránea temporalmente
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";
GO

-- Eliminar las tablas en el orden correcto (dependencias)
IF OBJECT_ID('DonorReceiverAssignments', 'U') IS NOT NULL
    DROP TABLE DonorReceiverAssignments;
GO

IF OBJECT_ID('Receivers', 'U') IS NOT NULL
    DROP TABLE Receivers;
GO

IF OBJECT_ID('Donors', 'U') IS NOT NULL
    DROP TABLE Donors;
GO

IF OBJECT_ID('Hospitals', 'U') IS NOT NULL
    DROP TABLE Hospitals;
GO

IF OBJECT_ID('Users', 'U') IS NOT NULL
    DROP TABLE Users;
GO

-- Habilitar las restricciones de clave foránea nuevamente
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";
GO

PRINT 'Base de datos limpiada exitosamente. Las tablas serán recreadas por Sequelize.';
GO 