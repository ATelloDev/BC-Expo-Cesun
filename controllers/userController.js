const { User, Donor, Receiver } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const userController = {
  // POST /users/register
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        Username,
        Password,
        Email,
        FirstName,
        LastName,
        PhoneNumber,
        BirthDate,
        Gender,
        BloodType,
        UserType
      } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { Username },
            { Email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'El usuario o email ya existe'
        });
      }

      // Crear el usuario
      const user = await User.create({
        Username,
        Password,
        Email,
        FirstName,
        LastName,
        PhoneNumber,
        BirthDate,
        Gender,
        BloodType,
        UserType
      });

      // Crear perfil específico según el tipo de usuario
      if (UserType === 'donor') {
        await Donor.create({
          UserID: user.UserID
        });
      } else if (UserType === 'receiver') {
        // Para receptores, se requiere HospitalID en el body
        const { HospitalID } = req.body;
        if (!HospitalID) {
          return res.status(400).json({
            message: 'HospitalID es requerido para receptores'
          });
        }
        
        await Receiver.create({
          UserID: user.UserID,
          HospitalID,
          MedicalRecordNumber: req.body.MedicalRecordNumber,
          Diagnosis: req.body.Diagnosis,
          DoctorName: req.body.DoctorName,
          RequiredDonations: req.body.RequiredDonations || 1,
          Deadline: req.body.Deadline,
          Story: req.body.Story
        });
      }

      // Retornar usuario sin contraseña
      const { Password: _, ...userWithoutPassword } = user.toJSON();
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // POST /users/login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { Username, Email, Password } = req.body;

      // Buscar usuario por username o email
      const whereClause = {};
      if (Username) {
        whereClause.Username = Username;
      } else if (Email) {
        whereClause.Email = Email;
      } else {
        return res.status(400).json({
          message: 'Se requiere Username o Email'
        });
      }

      const user = await User.findOne({
        where: whereClause,
        include: [
          {
            model: Donor,
            as: 'DonorProfile'
          },
          {
            model: Receiver,
            as: 'ReceiverProfile'
          }
        ]
      });

      if (!user) {
        return res.status(401).json({
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(Password);
      if (!isValidPassword) {
        return res.status(401).json({
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.IsActive) {
        return res.status(401).json({
          message: 'Usuario inactivo'
        });
      }

      // Actualizar último login
      await user.update({
        LastLogin: new Date()
      });

      // Retornar usuario sin contraseña
      const { Password: _, ...userWithoutPassword } = user.toJSON();
      
      res.json({
        message: 'Login exitoso',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /users - Obtener todos los usuarios
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['Password'] },
        order: [['CreatedAt', 'DESC']]
      });

      res.json({
        users: users.map(user => ({
          UserID: user.UserID,
          Username: user.Username,
          Email: user.Email,
          FirstName: user.FirstName,
          LastName: user.LastName,
          PhoneNumber: user.PhoneNumber,
          BirthDate: user.BirthDate,
          Gender: user.Gender,
          BloodType: user.BloodType,
          UserType: user.UserType,
          IsActive: user.IsActive,
          CreatedAt: user.CreatedAt,
          LastLogin: user.LastLogin
        })),
        total: users.length
      });

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // GET /users/{id} - Obtener usuario específico
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['Password'] }
      });

      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      res.json({ user });

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // PUT /users/{id} - Actualizar usuario
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el email ya existe en otro usuario
      if (updateData.Email && updateData.Email !== user.Email) {
        const existingUser = await User.findOne({
          where: { 
            Email: updateData.Email,
            UserID: { [Op.ne]: id }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            message: 'El email ya está en uso por otro usuario'
          });
        }
      }

      await user.update(updateData);

      // Retornar usuario sin contraseña
      const { Password: _, ...userWithoutPassword } = user.toJSON();
      
      res.json({
        message: 'Usuario actualizado exitosamente',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = userController; 