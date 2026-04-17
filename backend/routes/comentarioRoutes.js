const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');

// Ruta GET para obtener comentarios de una inspiración específica
// Ejemplo: http://localhost:5000/api/comentarios/inspiracion/123456789
router.get('/inspiracion/:inspiracionId', comentarioController.obtenerComentariosPorInspiracion);

// Rutas POST y DELETE básicas
router.post('/', comentarioController.crearComentario);
router.delete('/:id', comentarioController.eliminarComentario);

module.exports = router;