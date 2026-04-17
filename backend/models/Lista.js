const mongoose = require("mongoose");

const ListaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  creadaPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto"
  }]
}, { timestamps: true });

module.exports = mongoose.model("Lista", ListaSchema);