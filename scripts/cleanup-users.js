const sequelize = require('../config/database');
const { User, Donor, Receiver, DonorReceiverAssignment, DonationHistory, PublicStories } = require('../models');
const { Op } = require('sequelize');

async function cleanupUsers() {
    try {
        console.log('🔄 Iniciando limpieza de usuarios...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Obtener todos los usuarios
        const allUsers = await User.findAll({
            include: [
                { model: Donor, as: 'DonorProfile' },
                { model: Receiver, as: 'ReceiverProfile' }
            ],
            order: [['CreatedAt', 'ASC']]
        });
        
        console.log(`📊 Total de usuarios encontrados: ${allUsers.length}`);
        
        // Categorizar usuarios por tipo
        const admins = allUsers.filter(user => user.UserType === 'admin');
        const donors = allUsers.filter(user => user.UserType === 'donor');
        const receivers = allUsers.filter(user => user.UserType === 'receiver');
        
        console.log(`👨‍💼 Admins: ${admins.length}`);
        console.log(`🩸 Donadores: ${donors.length}`);
        console.log(`🏥 Receptores: ${receivers.length}`);
        
        // Seleccionar usuarios a mantener (el más antiguo de cada tipo)
        const usersToKeep = [];
        
        if (admins.length > 0) {
            usersToKeep.push(admins[0].UserID);
            console.log(`✅ Manteniendo admin: ${admins[0].Email} (ID: ${admins[0].UserID})`);
        }
        
        if (donors.length > 0) {
            usersToKeep.push(donors[0].UserID);
            console.log(`✅ Manteniendo donador: ${donors[0].Email} (ID: ${donors[0].UserID})`);
        }
        
        if (receivers.length > 0) {
            usersToKeep.push(receivers[0].UserID);
            console.log(`✅ Manteniendo receptor: ${receivers[0].Email} (ID: ${receivers[0].UserID})`);
        }
        
        // Obtener usuarios a eliminar
        const usersToDelete = allUsers.filter(user => !usersToKeep.includes(user.UserID));
        
        if (usersToDelete.length === 0) {
            console.log('✅ No hay usuarios para eliminar');
            return;
        }
        
        console.log(`🗑️ Usuarios a eliminar: ${usersToDelete.length}`);
        usersToDelete.forEach(user => {
            console.log(`   - ${user.Email} (${user.UserType})`);
        });
        
        // Confirmar eliminación
        console.log('\n⚠️ ¿Estás seguro de que quieres eliminar estos usuarios?');
        console.log('Esta acción no se puede deshacer.');
        console.log('Para continuar, ejecuta: node scripts/confirm-cleanup.js');
        
        // Crear archivo de confirmación
        const fs = require('fs');
        const confirmData = {
            usersToDelete: usersToDelete.map(user => ({
                UserID: user.UserID,
                Email: user.Email,
                UserType: user.UserType,
                FirstName: user.FirstName,
                LastName: user.LastName
            })),
            usersToKeep: usersToKeep
        };
        
        fs.writeFileSync('scripts/cleanup-confirmation.json', JSON.stringify(confirmData, null, 2));
        console.log('📄 Archivo de confirmación creado: scripts/cleanup-confirmation.json');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Función para ejecutar la eliminación confirmada
async function executeCleanup() {
    try {
        console.log('🔄 Ejecutando eliminación confirmada...');
        
        const fs = require('fs');
        if (!fs.existsSync('scripts/cleanup-confirmation.json')) {
            console.log('❌ No se encontró archivo de confirmación');
            return;
        }
        
        const confirmData = JSON.parse(fs.readFileSync('scripts/cleanup-confirmation.json', 'utf8'));
        const usersToDelete = confirmData.usersToDelete;
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        let deletedCount = 0;
        
        for (const userData of usersToDelete) {
            try {
                // Eliminar registros relacionados primero
                await DonorReceiverAssignment.destroy({
                    where: {
                        [Op.or]: [
                            { DonorID: userData.UserID },
                            { ReceiverID: userData.UserID }
                        ]
                    }
                });
                
                // Verificar si DonationHistory existe
                try {
                    await DonationHistory.destroy({
                        where: {
                            [Op.or]: [
                                { DonorID: userData.UserID },
                                { ReceiverID: userData.UserID }
                            ]
                        }
                    });
                } catch (error) {
                    console.log(`⚠️ DonationHistory no encontrado para ${userData.Email}`);
                }
                
                // Verificar si PublicStories existe
                try {
                    await PublicStories.destroy({
                        where: { UserID: userData.UserID }
                    });
                } catch (error) {
                    console.log(`⚠️ PublicStories no encontrado para ${userData.Email}`);
                }
                
                // Eliminar registros de Donor/Receiver
                await Donor.destroy({
                    where: { UserID: userData.UserID }
                });
                
                await Receiver.destroy({
                    where: { UserID: userData.UserID }
                });
                
                // Finalmente eliminar el usuario
                await User.destroy({
                    where: { UserID: userData.UserID }
                });
                
                console.log(`✅ Eliminado: ${userData.Email} (${userData.UserType})`);
                deletedCount++;
                
            } catch (error) {
                console.error(`❌ Error eliminando ${userData.Email}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Limpieza completada. ${deletedCount} usuarios eliminados.`);
        
        // Verificar usuarios restantes
        const remainingUsers = await User.findAll({
            attributes: ['UserID', 'Email', 'UserType', 'FirstName', 'LastName']
        });
        
        console.log('\n📊 Usuarios restantes:');
        remainingUsers.forEach(user => {
            console.log(`   - ${user.Email} (${user.UserType}) - ${user.FirstName} ${user.LastName}`);
        });
        
        // Eliminar archivo de confirmación
        fs.unlinkSync('scripts/cleanup-confirmation.json');
        console.log('🗑️ Archivo de confirmación eliminado');
        
    } catch (error) {
        console.error('❌ Error durante la eliminación:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar según el argumento
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
    executeCleanup();
} else {
    cleanupUsers();
} 