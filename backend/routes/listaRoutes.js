const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listaController');

// Rutas de Listas
router.get('/usuario/:usuarioId', listaController.obtenerListasPorUsuario);
router.post('/', listaController.crearLista);
router.put('/:id', listaController.actualizarLista);
router.delete('/:id', listaController.eliminarLista);

module.exports = router;