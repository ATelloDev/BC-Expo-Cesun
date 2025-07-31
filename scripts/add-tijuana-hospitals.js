const sequelize = require('../config/database');
const { Hospital } = require('../models');

const tijuanaHospitals = [
    {
        Name: 'Hospital General de Tijuana',
        Address: 'Blvd. Agua Caliente 4558',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'contacto@hgt.gob.mx',
        Description: 'Hospital público principal de Tijuana',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital Angeles Tijuana',
        Address: 'Blvd. Agua Caliente 4558',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'info@angeles.com.mx',
        Description: 'Hospital privado de alta especialidad',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital del Prado',
        Address: 'Av. Paseo de los Héroes 10099',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'contacto@hospitaldelprado.com',
        Description: 'Hospital privado con servicios integrales',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Centro Médico de las Californias',
        Address: 'Av. Revolución 1125',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'info@cmc.com.mx',
        Description: 'Centro médico especializado en tratamientos avanzados',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital San José',
        Address: 'Blvd. Sánchez Taboada 10604',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'contacto@hospitalsanjose.com',
        Description: 'Hospital privado con atención personalizada',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital IMSS Tijuana',
        Address: 'Av. Otay 200',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'imss.tijuana@imss.gob.mx',
        Description: 'Hospital del Instituto Mexicano del Seguro Social',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital ISSSTE Tijuana',
        Address: 'Blvd. Agua Caliente 4558',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'issste.tijuana@issste.gob.mx',
        Description: 'Hospital del Instituto de Seguridad y Servicios Sociales',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Centro Médico ABC Tijuana',
        Address: 'Av. Paseo de los Héroes 10099',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'tijuana@abchospital.com',
        Description: 'Centro médico de la Asociación Beneficencia Privada',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Hospital Puerta de Hierro Tijuana',
        Address: 'Blvd. Agua Caliente 4558',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'tijuana@puertadehierro.com',
        Description: 'Hospital especializado en tratamientos complejos',
        AdminUserID: 1,
        IsActive: true
    },
    {
        Name: 'Centro Médico Nacional Tijuana',
        Address: 'Av. Revolución 1125',
        City: 'Tijuana',
        State: 'Baja California',
        PostalCode: '22000',
        PhoneNumber: '664-104-7000',
        Email: 'contacto@cmntijuana.com',
        Description: 'Centro médico con tecnología de vanguardia',
        AdminUserID: 1,
        IsActive: true
    }
];

async function addTijuanaHospitals() {
    try {
        console.log('🏥 Agregando hospitales de Tijuana...');
        
        for (const hospitalData of tijuanaHospitals) {
            // Verificar si el hospital ya existe
            const existingHospital = await Hospital.findOne({
                where: { Name: hospitalData.Name }
            });
            
            if (existingHospital) {
                console.log(`⚠️  Hospital "${hospitalData.Name}" ya existe`);
                continue;
            }
            
            // Crear el hospital
            const hospital = await Hospital.create(hospitalData);
            console.log(`✅ Hospital "${hospital.Name}" agregado exitosamente`);
        }
        
        console.log('🎉 Proceso completado');
        
        // Mostrar estadísticas
        const totalHospitals = await Hospital.count();
        console.log(`📊 Total de hospitales en la base de datos: ${totalHospitals}`);
        
    } catch (error) {
        console.error('❌ Error agregando hospitales:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script
addTijuanaHospitals(); 