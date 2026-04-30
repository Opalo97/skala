const Producto = require('../models/Producto');
const Inspiracion = require('../models/Inspiracion'); // <-- Añade esto
const Lista = require('../models/Lista'); // <-- Añade esto
const Usuario = require('../models/Usuarios'); // <-- Añade esto para limpiar favoritos
// Acción: Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find()
            .populate('subidoPor', 'username nombreCompleto'); // Traemos datos del usuario que lo subió
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos', error });
    }
};

// Acción: Crear un nuevo producto
const crearProducto = async (req, res) => {
    try {
        // Validar que subidoPor está presente
        if (!req.body.subidoPor) {
            return res.status(400).json({ mensaje: 'Se requiere el ID del usuario (subidoPor)' });
        }

        // Validar que el nombre está presente
        if (!req.body.nombre) {
            return res.status(400).json({ mensaje: 'El nombre del producto es requerido' });
        }

        const nuevoProducto = await Producto.create(req.body);

        // Populate el usuario que lo creó para obtener más información
        await nuevoProducto.populate('subidoPor', 'username nombreCompleto');

        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el producto', error: error.message });
    }
};

// Acción: Eliminar un producto
// Acción: Eliminar un producto y limpiarlo de inspiraciones y listas
const eliminarProducto = async (req, res) => {
    try {
        const productoId = req.params.id;

        // 1. Borramos el producto de la base de datos principal
        const productoEliminado = await Producto.findByIdAndDelete(productoId);
        
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }

        // --- INICIO DEL BORRADO EN CASCADA ---

        // 2. Limpiamos las Inspiraciones: 
        // Buscamos cualquier inspiración que tenga este producto etiquetado y lo sacamos de la lista
        await Inspiracion.updateMany(
            { productos: productoId }, 
            { $pull: { productos: productoId } }
        );

        // 3. Limpiamos las Listas:
        // Buscamos cualquier lista de usuarios que haya guardado este producto y lo sacamos
        await Lista.updateMany(
            { productos: productoId }, 
            { $pull: { productos: productoId } }
        );

        // Limpiar Favoritos: Sacar este producto de los favoritos de cualquier usuario
        await Usuario.updateMany(
            { favoritosProductos: productoId },
            { $pull: { favoritosProductos: productoId } }
        );

        res.status(200).json({ mensaje: 'Producto eliminado y limpiado de todas las listas e inspiraciones' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar el producto', error });
    }
};



module.exports = {
    obtenerProductos,
    crearProducto,
    eliminarProducto
};