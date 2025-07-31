const { Hospital } = require('../models');

const hospitalController = {
  // POST /hospitals - Crear nuevo hospital
  async createHospital(req, res) {
    try {
      const {
        Name,
        Address,
        City,
        State,
        PostalCode,
        PhoneNumber,
        Email,
        Description,
        AdminUserID
      } = req.body;

      // Verificar si el hospital ya existe
      const existingHospital = await Hospital.findOne({
        where: { Name }
      });

      if (existingHospital) {
        return res.status(400).json({
          message: 'Ya existe un hospital con ese nombre'
        });
      }

      // Crear el hospital
      const hospital = await Hospital.create({
        Name,
        Address,
        City,
        State,
        PostalCode,
        PhoneNumber,
        Email,
        Description,
        AdminUserID: AdminUserID || 1,
        IsActive: true
      });

      res.status(201).json({
        message: 'Hospital creado exitosamente',
        hospital: {
          HospitalID: hospital.HospitalID,
          Name: hospital.Name,
          Address: hospital.Address,
          City: hospital.City,
          State: hospital.State,
          PostalCode: hospital.PostalCode,
          PhoneNumber: hospital.PhoneNumber,
          Email: hospital.Email,
          Description: hospital.Description,
          IsActive: hospital.IsActive
        }
      });

    } catch (error) {
      console.error('Error creando hospital:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /hospitals - Obtener todos los hospitales
  async getAllHospitals(req, res) {
    try {
      const hospitals = await Hospital.findAll({
        where: { IsActive: true },
        attributes: ['HospitalID', 'Name', 'Address', 'City', 'PhoneNumber', 'Email'],
        order: [['Name', 'ASC']]
      });

      res.json({
        hospitals: hospitals.map(hospital => ({
          HospitalID: hospital.HospitalID,
          Name: hospital.Name,
          Address: hospital.Address,
          City: hospital.City,
          PhoneNumber: hospital.PhoneNumber,
          Email: hospital.Email
        })),
        total: hospitals.length
      });

    } catch (error) {
      console.error('Error obteniendo hospitales:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /hospitals/{id} - Obtener hospital específico
  async getHospitalById(req, res) {
    try {
      const { id } = req.params;
      
      const hospital = await Hospital.findByPk(id, {
        attributes: ['HospitalID', 'Name', 'Address', 'City', 'PhoneNumber', 'Email', 'Description']
      });

      if (!hospital) {
        return res.status(404).json({
          message: 'Hospital no encontrado'
        });
      }

      res.json({ hospital });

    } catch (error) {
      console.error('Error obteniendo hospital:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = hospitalController; 