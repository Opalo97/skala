const mongoose = require('mongoose');

const elementoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio']
    },
    tipo: {
        type: String,
        required: [true, 'El tipo de contenido es obligatorio'],
        enum: ['2D', '3D', 'Audio', 'Video', 'Código', 'Otros'] // Solo permite estos valores exactos
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    imagenDescriptiva: {
        type: String, 
        required: [true, 'Debes incluir una imagen de vista previa']
        // Aquí guardaremos la URL o la ruta de la imagen
    },
    archivoContenido: {
        type: String,
        required: [true, 'El archivo multimedia es obligatorio']
        // Aquí guardaremos la URL o la ruta del archivo final (.jpg, .mp4, .obj, etc.)
    },
    fechaSubida: {
        type: Date,
        default: Date.now // Se pone la fecha actual automáticamente
    }
});

// Exportamos el modelo para poder usarlo en otras partes del servidor
module.exports = mongoose.model('Elemento', elementoSchema);