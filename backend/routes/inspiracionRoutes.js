const express = require('express');
const router = express.Router();
const multer = require('multer');
const inspiracionController = require('../controllers/inspiracionController');

const upload = multer({ storage: multer.memoryStorage() });

// Si piden un GET a '/', el controlador se encarga de buscar y devolver
router.get('/', inspiracionController.obtenerInspiraciones);
router.get('/usuario/:id', inspiracionController.obtenerInspiracionesUsuario);

// POST acepta archivos en 'multimedia' (varios)
router.post('/', upload.array('multimedia', 20), inspiracionController.crearInspiracion);
router.delete('/:id', inspiracionController.eliminarInspiracion);

module.exports = router;