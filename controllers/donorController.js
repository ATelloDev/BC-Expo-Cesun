const { Donor, User, DonorReceiverAssignment, Receiver, Hospital, DonationHistory } = require('../models');
const { calculateNextDonationDate, canDonateNow } = require('../utils/bloodCompatibility');

const donorController = {
  // POST /donors/{id}/donate
  async donate(req, res) {
    try {
      const { id } = req.params;
      const { AssignmentID, HospitalID, Notes } = req.body;

      // Buscar el donador por UserID (ya que el frontend envía UserID)
      const donor = await Donor.findOne({
        where: { UserID: id },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['UserID', 'Gender', 'BloodType', 'FirstName', 'LastName']
          }
        ]
      });

      if (!donor) {
        return res.status(404).json({
          message: 'Donador no encontrado'
        });
      }

      // Verificar si el donador puede donar
      if (!canDonateNow(donor.CanDonateAfter)) {
        return res.status(400).json({
          message: 'El donador no puede donar en este momento',
          canDonateAfter: donor.CanDonateAfter
        });
      }

      // Buscar la asignación si se proporciona AssignmentID
      let assignment = null;
      if (AssignmentID) {
        assignment = await DonorReceiverAssignment.findOne({
          where: { 
            AssignmentID,
            DonorID: donor.DonorID,
            Status: 'confirmed'
          },
          include: [
            {
              model: Receiver,
              as: 'Receiver',
              include: [
                {
                  model: User,
                  as: 'User',
                  attributes: ['FirstName', 'LastName', 'BloodType']
                }
              ]
            }
          ]
        });

        if (!assignment) {
          return res.status(404).json({
            message: 'Asignación no encontrada o no confirmada'
          });
        }

        // Verificar que la asignación sea para el hospital correcto
        if (assignment.HospitalID !== parseInt(HospitalID)) {
          return res.status(400).json({
            message: 'El hospital no coincide con la asignación'
          });
        }
      }

      const currentDate = new Date();

      // Actualizar información del donador
      const nextDonationDate = calculateNextDonationDate(
        donor.User.Gender,
        currentDate
      );

      await donor.update({
        LastDonationDate: currentDate,
        CanDonateAfter: nextDonationDate,
        TotalDonations: donor.TotalDonations + 1
      });

      // Crear registro en DonationHistory
      const donationHistoryRecord = await DonationHistory.create({
        DonorID: donor.DonorID,
        ReceiverID: assignment ? assignment.ReceiverID : null,
        HospitalID: parseInt(HospitalID),
        DonationDate: currentDate,
        BloodType: donor.User.BloodType,
        Amount: 450.00, // Cantidad estándar
        Status: 'completed',
        Notes: Notes || 'Donación registrada exitosamente'
      });

      // Actualizar asignación si existe
      if (assignment) {
        await assignment.update({
          Status: 'completed',
          DonationDate: currentDate,
          Notes: Notes || 'Donación registrada exitosamente'
        });

        // Actualizar contador del receptor
        const receiver = assignment.Receiver;
        const newCurrentDonations = receiver.CurrentDonations + 1;
        
        await receiver.update({
          CurrentDonations: newCurrentDonations,
          Status: newCurrentDonations >= receiver.RequiredDonations ? 'completed' : 'active'
        });
      }

      // Crear nueva asignación si no se proporcionó AssignmentID
      if (!AssignmentID && HospitalID) {
        await DonorReceiverAssignment.create({
          DonorID: donor.DonorID,
          ReceiverID: null, // Asignación general sin receptor específico
          HospitalID: parseInt(HospitalID),
          Status: 'completed',
          DonationDate: currentDate,
          Notes: Notes || 'Donación general registrada'
        });
      }

      res.json({
        message: 'Donación registrada exitosamente',
        donor: {
          DonorID: donor.DonorID,
          LastDonationDate: currentDate,
          CanDonateAfter: nextDonationDate,
          TotalDonations: donor.TotalDonations + 1
        },
        donationHistory: {
          HistoryID: donationHistoryRecord.HistoryID,
          DonationDate: currentDate,
          BloodType: donor.User.BloodType,
          Status: 'completed'
        },
        assignment: assignment ? {
          AssignmentID: assignment.AssignmentID,
          Status: 'completed',
          DonationDate: currentDate,
          Receiver: assignment.Receiver ? {
            ReceiverID: assignment.Receiver.ReceiverID,
            CurrentDonations: assignment.Receiver.CurrentDonations + 1,
            Status: assignment.Receiver.CurrentDonations + 1 >= assignment.Receiver.RequiredDonations ? 'completed' : 'active'
          } : null
        } : null
      });

    } catch (error) {
      console.error('Error en donación:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /donors - Obtener todos los donadores
  async getAllDonors(req, res) {
    try {
      const donors = await Donor.findAll({
        include: [
          {
            model: User,
            as: 'User',
            where: { IsActive: true },
            attributes: ['UserID', 'FirstName', 'LastName', 'BloodType', 'Email', 'PhoneNumber']
          }
        ],
        order: [['CreatedAt', 'DESC']]
      });

      res.json({
        donors: donors.map(donor => ({
          DonorID: donor.DonorID,
          User: donor.User,
          LastDonationDate: donor.LastDonationDate,
          CanDonateAfter: donor.CanDonateAfter,
          TotalDonations: donor.TotalDonations,
          CanDonateNow: canDonateNow(donor.CanDonateAfter),
          CreatedAt: donor.CreatedAt
        })),
        total: donors.length
      });

    } catch (error) {
      console.error('Error obteniendo donadores:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /donors/available
  async getAvailableDonors(req, res) {
    try {
      const donors = await Donor.findAll({
        where: {
          IsPublic: true
        },
        include: [
          {
            model: User,
            as: 'User',
            where: { IsActive: true },
            attributes: ['FirstName', 'LastName', 'BloodType', 'Gender']
          }
        ]
      });

      // Filtrar donadores disponibles
      const availableDonors = donors.filter(donor => 
        canDonateNow(donor.CanDonateAfter)
      );

      res.json({
        donors: availableDonors.map(donor => ({
          DonorID: donor.DonorID,
          User: donor.User,
          LastDonationDate: donor.LastDonationDate,
          CanDonateAfter: donor.CanDonateAfter,
          TotalDonations: donor.TotalDonations,
          IsAvailable: true
        }))
      });

    } catch (error) {
      console.error('Error obteniendo donadores disponibles:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /donors/{id}/history - Obtener historial de donaciones
  async getDonationHistory(req, res) {
    try {
      const { id } = req.params;
      
      // Primero buscar el donador por UserID
      const donor = await Donor.findOne({
        where: { UserID: id }
      });

      if (!donor) {
        return res.status(404).json({
          message: 'Donador no encontrado'
        });
      }
      
      const donationHistory = await DonationHistory.findAll({
        where: { 
          DonorID: donor.DonorID,
          Status: 'completed'
        },
        include: [
          {
            model: Receiver,
            as: 'Receiver',
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['FirstName', 'LastName', 'BloodType']
              }
            ]
          },
          {
            model: Hospital,
            as: 'Hospital',
            attributes: ['Name', 'Address', 'City']
          }
        ],
        order: [['DonationDate', 'DESC']]
      });

      res.json({
        history: donationHistory.map(record => ({
          HistoryID: record.HistoryID,
          DonationDate: record.DonationDate,
          BloodType: record.BloodType,
          Amount: record.Amount,
          Notes: record.Notes,
          Hospital: record.Hospital,
          Receiver: record.Receiver ? {
            ReceiverID: record.Receiver.ReceiverID,
            User: record.Receiver.User,
            Diagnosis: record.Receiver.Diagnosis
          } : null
        })),
        total: donationHistory.length
      });

    } catch (error) {
      console.error('Error obteniendo historial de donaciones:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /donors/{id}/stats - Obtener estadísticas del donador
  async getDonorStats(req, res) {
    try {
      const { id } = req.params;
      
      const donor = await Donor.findOne({
        where: { UserID: id },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['FirstName', 'LastName', 'BloodType', 'Gender']
          }
        ]
      });

      if (!donor) {
        return res.status(404).json({
          message: 'Donador no encontrado'
        });
      }

      // Contar donaciones totales
      const totalDonations = await DonationHistory.count({
        where: { 
          DonorID: donor.DonorID,
          Status: 'completed'
        }
      });

      // Contar donaciones este año
      const currentYear = new Date().getFullYear();
      const donationsThisYear = await DonationHistory.count({
        where: { 
          DonorID: donor.DonorID,
          Status: 'completed',
          DonationDate: {
            [require('sequelize').Op.gte]: new Date(currentYear, 0, 1)
          }
        }
      });

      // Verificar si puede donar ahora
      const canDonate = canDonateNow(donor.CanDonateAfter);

      res.json({
        donor: {
          DonorID: donor.DonorID,
          User: donor.User,
          LastDonationDate: donor.LastDonationDate,
          CanDonateAfter: donor.CanDonateAfter,
          TotalDonations: totalDonations,
          DonationsThisYear: donationsThisYear,
          CanDonateNow: canDonate
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del donador:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = donorController; 