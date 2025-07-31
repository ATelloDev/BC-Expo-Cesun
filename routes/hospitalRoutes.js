const express = require('express');
const hospitalController = require('../controllers/hospitalController');

const router = express.Router();

// POST /hospitals - Crear nuevo hospital
router.post('/', hospitalController.createHospital);

// GET /hospitals - Obtener todos los hospitales
router.get('/', hospitalController.getAllHospitals);

// GET /hospitals/{id} - Obtener hospital específico
router.get('/:id', hospitalController.getHospitalById);

module.exports = router; 