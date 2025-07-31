const sequelize = require('../config/database');
const { DonorReceiverAssignment, DonationHistory, Donor, User } = require('../models');

async function syncDonationHistory() {
    try {
        console.log('🔄 Sincronizando historial de donaciones...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Obtener todas las asignaciones completadas
        const completedAssignments = await DonorReceiverAssignment.findAll({
            where: { Status: 'completed' },
            include: [
                {
                    model: Donor,
                    as: 'Donor',
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['BloodType']
                        }
                    ]
                }
            ],
            order: [['DonationDate', 'ASC']]
        });
        
        console.log(`📊 Encontradas ${completedAssignments.length} donaciones completadas`);
        
        let syncedCount = 0;
        
        for (const assignment of completedAssignments) {
            try {
                // Verificar si ya existe en DonationHistory
                const existingRecord = await DonationHistory.findOne({
                    where: {
                        DonorID: assignment.DonorID,
                        ReceiverID: assignment.ReceiverID,
                        HospitalID: assignment.HospitalID,
                        DonationDate: assignment.DonationDate
                    }
                });
                
                if (!existingRecord) {
                    // Crear registro en DonationHistory
                    await DonationHistory.create({
                        DonorID: assignment.DonorID,
                        ReceiverID: assignment.ReceiverID,
                        HospitalID: assignment.HospitalID,
                        DonationDate: assignment.DonationDate,
                        BloodType: assignment.Donor.User.BloodType,
                        Amount: 450.00, // Cantidad estándar
                        Status: 'completed',
                        Notes: assignment.Notes || 'Donación sincronizada',
                        CreatedAt: assignment.DonationDate
                    });
                    
                    syncedCount++;
                    console.log(`✅ Sincronizada donación: DonorID ${assignment.DonorID} - ${assignment.DonationDate}`);
                } else {
                    console.log(`⚠️ Donación ya existe: DonorID ${assignment.DonorID} - ${assignment.DonationDate}`);
                }
                
            } catch (error) {
                console.error(`❌ Error sincronizando donación ${assignment.AssignmentID}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Sincronización completada. ${syncedCount} registros sincronizados.`);
        
        // Verificar total de registros en DonationHistory
        const totalHistoryRecords = await DonationHistory.count();
        console.log(`📊 Total de registros en DonationHistory: ${totalHistoryRecords}`);
        
    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Conexión cerrada');
    }
}

syncDonationHistory(); 