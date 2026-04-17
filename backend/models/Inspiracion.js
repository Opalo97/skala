const mongoose = require("mongoose");

const InspiracionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  zonaCasa: { type: String, required: true },
  categoriaDecoracion: { type: String, required: true },
  multimedia: {
    imagenes: [{ type: String }],
    videos: [{ type: String }]
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto"
  }],
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  likes: { type: Number, default: 0 },
  guardados: { type: Number, default: 0 },
  comentariosCount: { type: Number, default: 0 },
  publicado: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Inspiracion", InspiracionSchema);