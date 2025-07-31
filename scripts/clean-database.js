const sequelize = require('../config/database');

async function cleanDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');
    
    // Obtener todas las restricciones de clave foránea de todas las tablas
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        fk.name as constraint_name,
        OBJECT_NAME(fk.parent_object_id) as table_name
      FROM sys.foreign_keys fk
    `);
    
    console.log(`📋 Encontradas ${foreignKeys.length} restricciones de clave foránea.`);
    
    // Eliminar todas las restricciones de clave foránea
    for (const fk of foreignKeys) {
      try {
        await sequelize.query(`ALTER TABLE [${fk.table_name}] DROP CONSTRAINT [${fk.constraint_name}]`);
        console.log(`✅ Restricción ${fk.constraint_name} eliminada de ${fk.table_name}`);
      } catch (error) {
        console.log(`⚠️  No se pudo eliminar restricción ${fk.constraint_name}:`, error.message);
      }
    }
    
    // Eliminar tablas en orden correcto
    const tables = [
      'DonorReceiverAssignments',
      'Receivers', 
      'Donors',
      'Hospitals',
      'Users'
    ];
    
    for (const table of tables) {
      try {
        await sequelize.query(`IF OBJECT_ID('${table}', 'U') IS NOT NULL DROP TABLE [${table}];`);
        console.log(`✅ Tabla ${table} eliminada.`);
      } catch (error) {
        console.log(`⚠️  Tabla ${table} no existía o no se pudo eliminar:`, error.message);
      }
    }
    
    console.log('🎉 Base de datos limpiada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDatabase();
}

module.exports = cleanDatabase; 