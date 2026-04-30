const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Multer con Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'skala/usuarios',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        resource_type: 'image',
    },
});

const upload = multer({ storage: storage });

// Rutas para la raíz ('/api/usuarios')
router.get('/', usuarioController.obtenerUsuarios);
router.post('/', upload.single('fotoPerfil'), usuarioController.crearUsuario);

// Rutas con ID ('/api/usuarios/:id')
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.delete('/:id', usuarioController.eliminarUsuario);

module.exports = router;