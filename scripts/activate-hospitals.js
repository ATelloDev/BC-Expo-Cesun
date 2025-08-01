const sequelize = require('../config/database');
const { Hospital } = require('../models');

async function activateHalfHospitals() {
    try {
        console.log('🏥 Activando la mitad de los hospitales...');
        
        // Obtener todos los hospitales
        const allHospitals = await Hospital.findAll({
            order: [['HospitalID', 'ASC']]
        });
        
        console.log(`📊 Total de hospitales encontrados: ${allHospitals.length}`);
        
        if (allHospitals.length === 0) {
            console.log('⚠️  No hay hospitales en la base de datos');
            return;
        }
        
        // Calcular cuántos activar (la mitad)
        const hospitalsToActivate = Math.ceil(allHospitals.length / 2);
        console.log(`🎯 Activando ${hospitalsToActivate} hospitales de ${allHospitals.length}`);
        
        // Activar la primera mitad
        for (let i = 0; i < hospitalsToActivate; i++) {
            const hospital = allHospitals[i];
            await hospital.update({ IsActive: true });
            console.log(`✅ Activado: ${hospital.Name}`);
        }
        
        // Desactivar la segunda mitad
        for (let i = hospitalsToActivate; i < allHospitals.length; i++) {
            const hospital = allHospitals[i];
            await hospital.update({ IsActive: false });
            console.log(`❌ Desactivado: ${hospital.Name}`);
        }
        
        // Mostrar estadísticas finales
        const activeHospitals = await Hospital.count({ where: { IsActive: true } });
        const inactiveHospitals = await Hospital.count({ where: { IsActive: false } });
        
        console.log('🎉 Proceso completado');
        console.log(`📊 Hospitales activos: ${activeHospitals}`);
        console.log(`📊 Hospitales inactivos: ${inactiveHospitals}`);
        
    } catch (error) {
        console.error('❌ Error activando hospitales:', error);
    } finally {
        await sequelize.close();
    }
}

// Ejecutar el script
activateHalfHospitals(); 