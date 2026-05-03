const express = require('express');
const router = express.Router();
const multer = require('multer');
const productoController = require('../controllers/productoController');

// Usamos memoryStorage para manejar los buffers y subir desde el servidor a Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);
router.get('/usuario/:id', productoController.obtenerProductosUsuario);
// Recibe campos y archivos: fotos (max 5), videos (max 3), modelo (max 1)
router.post('/', upload.fields([
	{ name: 'fotos', maxCount: 5 },
	{ name: 'videos', maxCount: 3 },
	{ name: 'modelo', maxCount: 1 }
]), productoController.crearProducto);
router.put('/:id', upload.none(), productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;