const sequelize = require('../config/database');
const { User, Hospital, Donor, Receiver } = require('../models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando población de la base de datos...');

    // Crear usuarios administradores
    const adminUser = await User.create({
      Username: 'admin_hospital1',
      Password: await bcrypt.hash('admin123', 10),
      Email: 'admin@hospital1.com',
      FirstName: 'Administrador',
      LastName: 'Hospital 1',
      PhoneNumber: '1234567890',
      BirthDate: '1980-01-01',
      Gender: 'M',
      BloodType: 'O+',
      UserType: 'admin',
      IsActive: true
    });

    // Crear hospital
    const hospital = await Hospital.create({
      Name: 'Hospital General de la Ciudad',
      Address: 'Av. Principal 123',
      City: 'Ciudad de México',
      State: 'CDMX',
      PostalCode: '12345',
      PhoneNumber: '555-123-4567',
      Email: 'contacto@hospitalgeneral.com',
      AdminUserID: adminUser.UserID,
      IsActive: true
    });

    // Crear usuarios donadores
    const donorUsers = [
      {
        Username: 'juan_donor',
        Email: 'juan@email.com',
        FirstName: 'Juan',
        LastName: 'Pérez',
        PhoneNumber: '555-111-1111',
        BirthDate: '1990-01-15',
        Gender: 'M',
        BloodType: 'O+',
        UserType: 'donor'
      },
      {
        Username: 'maria_donor',
        Email: 'maria@email.com',
        FirstName: 'María',
        LastName: 'García',
        PhoneNumber: '555-222-2222',
        BirthDate: '1985-05-20',
        Gender: 'F',
        BloodType: 'A+',
        UserType: 'donor'
      },
      {
        Username: 'carlos_donor',
        Email: 'carlos@email.com',
        FirstName: 'Carlos',
        LastName: 'López',
        PhoneNumber: '555-333-3333',
        BirthDate: '1992-08-10',
        Gender: 'M',
        BloodType: 'B+',
        UserType: 'donor'
      },
      {
        Username: 'ana_donor',
        Email: 'ana@email.com',
        FirstName: 'Ana',
        LastName: 'Martínez',
        PhoneNumber: '555-444-4444',
        BirthDate: '1988-12-05',
        Gender: 'F',
        BloodType: 'AB+',
        UserType: 'donor'
      }
    ];

    for (const donorData of donorUsers) {
      const user = await User.create({
        ...donorData,
        Password: await bcrypt.hash('password123', 10),
        IsActive: true
      });

      await Donor.create({
        UserID: user.UserID,
        IsPublic: true
      });
    }

    // Crear usuarios receptores
    const receiverUsers = [
      {
        Username: 'pedro_receiver',
        Email: 'pedro@email.com',
        FirstName: 'Pedro',
        LastName: 'Rodríguez',
        PhoneNumber: '555-555-5555',
        BirthDate: '1975-03-25',
        Gender: 'M',
        BloodType: 'O+',
        UserType: 'receiver',
        MedicalRecordNumber: 'MRN001',
        Diagnosis: 'Leucemia aguda',
        DoctorName: 'Dr. García',
        RequiredDonations: 3,
        Deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        Story: 'Necesita donaciones urgentes para tratamiento de leucemia'
      },
      {
        Username: 'lucia_receiver',
        Email: 'lucia@email.com',
        FirstName: 'Lucía',
        LastName: 'Fernández',
        PhoneNumber: '555-666-6666',
        BirthDate: '1980-07-12',
        Gender: 'F',
        BloodType: 'A+',
        UserType: 'receiver',
        MedicalRecordNumber: 'MRN002',
        Diagnosis: 'Anemia severa',
        DoctorName: 'Dr. Martínez',
        RequiredDonations: 2,
        Deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
        Story: 'Paciente con anemia severa que requiere transfusiones'
      },
      {
        Username: 'roberto_receiver',
        Email: 'roberto@email.com',
        FirstName: 'Roberto',
        LastName: 'Sánchez',
        PhoneNumber: '555-777-7777',
        BirthDate: '1965-11-30',
        Gender: 'M',
        BloodType: 'B+',
        UserType: 'receiver',
        MedicalRecordNumber: 'MRN003',
        Diagnosis: 'Cirugía cardíaca',
        DoctorName: 'Dr. López',
        RequiredDonations: 4,
        Deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        Story: 'Programado para cirugía cardíaca, necesita reserva de sangre'
      }
    ];

    for (const receiverData of receiverUsers) {
      const { MedicalRecordNumber, Diagnosis, DoctorName, RequiredDonations, Deadline, Story, ...userData } = receiverData;
      
      const user = await User.create({
        ...userData,
        Password: await bcrypt.hash('password123', 10),
        IsActive: true
      });

      await Receiver.create({
        UserID: user.UserID,
        HospitalID: hospital.HospitalID,
        MedicalRecordNumber,
        Diagnosis,
        DoctorName,
        RequiredDonations,
        Deadline,
        Story,
        Status: 'active',
        IsPublic: true
      });
    }

    console.log('✅ Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen de datos creados:');
    console.log('- 1 Administrador');
    console.log('- 1 Hospital');
    console.log('- 4 Donadores');
    console.log('- 3 Receptores');
    console.log('\n🔑 Credenciales de prueba:');
    console.log('Admin: admin_hospital1 / admin123');
    console.log('Donador: juan_donor / password123');
    console.log('Receptor: pedro_receiver / password123');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 