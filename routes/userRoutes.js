const express = require('express');
const userController = require('../controllers/userController');
const { userValidators } = require('../middleware/validators');

const router = express.Router();

// GET /users - Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// POST /users/register - Registrar nuevo usuario
router.post('/register', userValidators.register, userController.register);

// POST /users/login - Autenticar usuario
router.post('/login', userValidators.login, userController.login);

// GET /users/{id} - Obtener usuario específico
router.get('/:id', userController.getUserById);

// PUT /users/{id} - Actualizar usuario
router.put('/:id', userController.updateUser);

module.exports = router; 