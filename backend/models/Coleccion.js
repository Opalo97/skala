const mongoose = require("mongoose");

const ColeccionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  creadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  inspiraciones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inspiracion"
  }]
}, { timestamps: true });

module.exports = mongoose.model("Coleccion", ColeccionSchema);