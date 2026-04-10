const express = require('express');
const router = express.Router();
const { crearElemento } = require('../controllers/elementoController');

// Ruta POST: Sirve para enviar datos nuevos al servidor
// La URL final será: POST /api/elementos
router.post('/', crearElemento);

module.exports = router;