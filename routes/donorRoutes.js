const express = require('express');
const donorController = require('../controllers/donorController');
const { donorValidators } = require('../middleware/validators');

const router = express.Router();

// GET /donors - Obtener todos los donadores
router.get('/', donorController.getAllDonors);

// POST /donors/{id}/donate - Registrar donación
router.post('/:id/donate', donorValidators.donate, donorController.donate);

// GET /donors/available - Listar donadores disponibles
router.get('/available', donorController.getAvailableDonors);

// GET /donors/{id}/history - Obtener historial de donaciones
router.get('/:id/history', donorController.getDonationHistory);

// GET /donors/{id}/stats - Obtener estadísticas del donador
router.get('/:id/stats', donorController.getDonorStats);

module.exports = router; 