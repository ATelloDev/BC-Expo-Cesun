const { Receiver, User, DonorReceiverAssignment, Hospital, Donor, DonationHistory } = require('../models');
const { Op } = require('sequelize');

const receiverController = {
  // GET /receivers - Obtener todos los receptores
  async getAllReceivers(req, res) {
    try {
      const receivers = await Receiver.findAll({
        include: [
          {
            model: User,
            as: 'User',
            where: { IsActive: true },
            attributes: ['UserID', 'FirstName', 'LastName', 'BloodType', 'Email', 'PhoneNumber']
          },
          {
            model: Hospital,
            as: 'Hospital',
            attributes: ['Name', 'Address', 'City']
          }
        ],
        order: [['CreatedAt', 'DESC']]
      });

      res.json({
        receivers: receivers.map(receiver => ({
          ReceiverID: receiver.ReceiverID,
          User: receiver.User,
          Hospital: receiver.Hospital,
          MedicalRecordNumber: receiver.MedicalRecordNumber,
          Diagnosis: receiver.Diagnosis,
          DoctorName: receiver.DoctorName,
          RequiredDonations: receiver.RequiredDonations,
          CurrentDonations: receiver.CurrentDonations,
          ProgressPercentage: Math.round((receiver.CurrentDonations / receiver.RequiredDonations) * 100),
          Deadline: receiver.Deadline,
          Story: receiver.Story,
          Status: receiver.Status,
          CreatedAt: receiver.CreatedAt
        })),
        total: receivers.length
      });

    } catch (error) {
      console.error('Error obteniendo receptores:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /receivers/urgent
  async getUrgentReceivers(req, res) {
    try {
      const receivers = await Receiver.findAll({
        where: {
          Status: 'active',
          Deadline: {
            [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
          }
        },
        include: [
          {
            model: User,
            as: 'User',
            where: { IsActive: true },
            attributes: ['FirstName', 'LastName', 'BloodType', 'PhoneNumber', 'Email']
          },
          {
            model: Hospital,
            as: 'Hospital',
            attributes: ['Name', 'Address', 'City', 'PhoneNumber']
          }
        ],
        order: [['Deadline', 'ASC']]
      });

      res.json({
        receivers: receivers.map(receiver => ({
          ReceiverID: receiver.ReceiverID,
          User: receiver.User,
          Hospital: receiver.Hospital,
          MedicalRecordNumber: receiver.MedicalRecordNumber,
          Diagnosis: receiver.Diagnosis,
          DoctorName: receiver.DoctorName,
          RequiredDonations: receiver.RequiredDonations,
          CurrentDonations: receiver.CurrentDonations,
          ProgressPercentage: Math.round((receiver.CurrentDonations / receiver.RequiredDonations) * 100),
          Deadline: receiver.Deadline,
          Story: receiver.Story,
          Status: receiver.Status,
          CreatedAt: receiver.CreatedAt
        })),
        total: receivers.length
      });

    } catch (error) {
      console.error('Error obteniendo receptores urgentes:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /receivers/{id} - Obtener receptor específico
  async getReceiverById(req, res) {
    try {
      const { id } = req.params;
      
      // Primero intentar buscar por ReceiverID
      let receiver = await Receiver.findOne({
        where: { ReceiverID: id },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['FirstName', 'LastName', 'BloodType', 'PhoneNumber', 'Email']
          },
          {
            model: Hospital,
            as: 'Hospital',
            attributes: ['Name', 'Address', 'City', 'PhoneNumber']
          }
        ]
      });

      // Si no se encuentra por ReceiverID, buscar por UserID
      if (!receiver) {
        receiver = await Receiver.findOne({
          where: { UserID: id },
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['FirstName', 'LastName', 'BloodType', 'PhoneNumber', 'Email']
            },
            {
              model: Hospital,
              as: 'Hospital',
              attributes: ['Name', 'Address', 'City', 'PhoneNumber']
            }
          ]
        });
      }

      if (!receiver) {
        return res.status(404).json({
          message: 'Receptor no encontrado'
        });
      }

      res.json({
        receiver: {
          ReceiverID: receiver.ReceiverID,
          User: receiver.User,
          Hospital: receiver.Hospital,
          MedicalRecordNumber: receiver.MedicalRecordNumber,
          Diagnosis: receiver.Diagnosis,
          DoctorName: receiver.DoctorName,
          RequiredDonations: receiver.RequiredDonations,
          CurrentDonations: receiver.CurrentDonations,
          ProgressPercentage: Math.round((receiver.CurrentDonations / receiver.RequiredDonations) * 100),
          Deadline: receiver.Deadline,
          Story: receiver.Story,
          Status: receiver.Status,
          CreatedAt: receiver.CreatedAt
        }
      });

    } catch (error) {
      console.error('Error obteniendo receptor:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /receivers/{id}/donations - Obtener historial de donaciones recibidas
  async getReceiverDonations(req, res) {
    try {
      const { id } = req.params;
      
      // Primero obtener el ReceiverID si se pasa UserID
      let receiverId = id;
      if (isNaN(id) || parseInt(id) > 1000) { // Si es un UserID (generalmente mayor)
        const receiver = await Receiver.findOne({
          where: { UserID: id }
        });
        if (receiver) {
          receiverId = receiver.ReceiverID;
        }
      }
      
      const donations = await DonationHistory.findAll({
        where: { 
          ReceiverID: receiverId,
          Status: 'completed'
        },
        include: [
          {
            model: Donor,
            as: 'Donor',
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
        donations: donations.map(donation => ({
          HistoryID: donation.HistoryID,
          DonationDate: donation.DonationDate,
          BloodType: donation.BloodType,
          Amount: donation.Amount,
          Notes: donation.Notes,
          Hospital: donation.Hospital,
          Donor: donation.Donor ? {
            DonorID: donation.Donor.DonorID,
            User: donation.Donor.User
          } : null
        })),
        total: donations.length
      });

    } catch (error) {
      console.error('Error obteniendo donaciones del receptor:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // PUT /receivers/{id} - Actualizar receptor
  async updateReceiver(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Buscar por ReceiverID primero, luego por UserID
      let receiver = await Receiver.findByPk(id);
      
      if (!receiver) {
        receiver = await Receiver.findOne({
          where: { UserID: id }
        });
      }
      
      if (!receiver) {
        return res.status(404).json({
          message: 'Receptor no encontrado'
        });
      }

      await receiver.update(updateData);

      res.json({
        message: 'Receptor actualizado exitosamente',
        receiver: {
          ReceiverID: receiver.ReceiverID,
          Diagnosis: receiver.Diagnosis,
          DoctorName: receiver.DoctorName,
          RequiredDonations: receiver.RequiredDonations,
          CurrentDonations: receiver.CurrentDonations,
          Deadline: receiver.Deadline,
          Story: receiver.Story,
          Status: receiver.Status
        }
      });

    } catch (error) {
      console.error('Error actualizando receptor:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = receiverController; 