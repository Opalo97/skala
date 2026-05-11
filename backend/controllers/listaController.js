const Lista = require('../models/Lista');

// Obtener todas las listas de productos de un usuario concreto
const obtenerListasPorUsuario = async (req, res) => {
    try {
        const listas = await Lista.find({ creadaPor: req.params.usuarioId })
            .populate('productos'); // Trae la info completa de los productos guardados
        res.status(200).json(listas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las listas', error });
    }
};

// Obtener una lista por su ID
const obtenerListaPorId = async (req, res) => {
    try {
        const lista = await Lista.findById(req.params.id).populate('productos');
        if (!lista) return res.status(404).json({ mensaje: 'Lista no encontrada' });
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener la lista', error });
    }
};

// Crear una nueva lista
const crearLista = async (req, res) => {
    try {
        const nuevaLista = await Lista.create(req.body);
        res.status(201).json(nuevaLista);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear la lista', error });
    }
};

// Actualizar una lista (ej: añadir un nuevo mueble a la lista "Salón")
const actualizarLista = async (req, res) => {
    try {
        const listaActualizada = await Lista.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { returnDocument: 'after' }
        );
        res.status(200).json(listaActualizada);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar la lista', error });
    }
};

// Eliminar una lista
const eliminarLista = async (req, res) => {
    try {
        await Lista.findByIdAndDelete(req.params.id);
        res.status(200).json({ mensaje: 'Lista eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar la lista', error });
    }
};

module.exports = {
    obtenerListasPorUsuario,
    obtenerListaPorId,
    crearLista,
    actualizarLista,
    eliminarLista
};