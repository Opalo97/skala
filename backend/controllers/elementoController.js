// Importamos el modelo que creamos en el paso anterior
const Elemento = require('../models/Elemento');

// Función para guardar un nuevo elemento multimedia
const crearElemento = async (req, res) => {
    try {
        // req.body contiene los datos que enviaremos (título, descripción, etc.)
        const nuevoElemento = new Elemento(req.body);
        
        // Lo guardamos en la base de datos
        await nuevoElemento.save();
        
        // Respondemos que todo ha ido bien (Código 201: Creado)
        res.status(201).json({ 
            mensaje: '✅ Elemento multimedia guardado con éxito', 
            elemento: nuevoElemento 
        });
    } catch (error) {
        // Si falta algún dato obligatorio (como el título), saltará este error
        res.status(400).json({ 
            mensaje: '❌ Error al guardar el elemento', 
            error: error.message 
        });
    }
};

module.exports = {
    crearElemento
};