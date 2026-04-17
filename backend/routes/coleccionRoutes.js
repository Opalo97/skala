const express = require('express');
const router = express.Router();
const coleccionController = require('../controllers/coleccionController');

// Rutas de Colecciones
router.get('/usuario/:usuarioId', coleccionController.obtenerColeccionesPorUsuario);
router.post('/', coleccionController.crearColeccion);
router.put('/:id', coleccionController.actualizarColeccion); // PUT se usa para actualizar
router.delete('/:id', coleccionController.eliminarColeccion);

module.exports = router;