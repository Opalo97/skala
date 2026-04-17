const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas para la raíz ('/api/usuarios')
router.get('/', usuarioController.obtenerUsuarios);
router.post('/', usuarioController.crearUsuario);

// Rutas con ID ('/api/usuarios/:id')
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;