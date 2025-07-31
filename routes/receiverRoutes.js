const express = require('express');
const receiverController = require('../controllers/receiverController');

const router = express.Router();

// GET /receivers - Obtener todos los receptores
router.get('/', receiverController.getAllReceivers);

// GET /receivers/urgent - Obtener receptores urgentes
router.get('/urgent', receiverController.getUrgentReceivers);

// GET /receivers/{id} - Obtener receptor específico
router.get('/:id', receiverController.getReceiverById);

// GET /receivers/{id}/donations - Obtener historial de donaciones recibidas
router.get('/:id/donations', receiverController.getReceiverDonations);

// PUT /receivers/{id} - Actualizar receptor
router.put('/:id', receiverController.updateReceiver);

module.exports = router; 