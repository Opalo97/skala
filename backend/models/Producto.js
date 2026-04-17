const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  linkCompra: { type: String, default: "" },
  vendedor: { type: String, default: "" },
  precio: { type: Number, default: 0 },
  especificaciones: {
    dimensiones: { type: String, default: "" },
    materiales: { type: String, default: "" },
    color: { type: String, default: "" },
    peso: { type: String, default: "" }
  },
  imagenes: [{ type: String }],
  videos: [{ type: String }],
  modelo3d: { type: String, default: "" },
  subidoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Producto", ProductoSchema);