const mongoose = require("mongoose");

const ComentarioSchema = new mongoose.Schema({
  inspiracion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inspiracion",
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  texto: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Comentario", ComentarioSchema);