const express = require('express');
const router = express.Router();
const inspiracionController = require('../controllers/inspiracionController');

// Si piden un GET a '/', el controlador se encarga de buscar y devolver
router.get('/', inspiracionController.obtenerInspiraciones);

// Si piden un POST a '/', el controlador se encarga de crear
router.post('/', inspiracionController.crearInspiracion);
// Añade esta línea debajo de tu router.get y router.post
router.delete('/:id', inspiracionController.eliminarInspiracion);

module.exports = router;