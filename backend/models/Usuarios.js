const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fotoPerfil: { type: String, default: "" },
  bio: { type: String, default: "" },
  seguidores: { type: Number, default: 0 },
  seguidos: { type: Number, default: 0 },
  favoritosInspiraciones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inspiracion"
  }],
  favoritosProductos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto"
  }],
  preferenciasAccesibilidad: {
    tamanoFuente: {
      type: String,
      enum: ["pequena", "mediano", "grande", "muy-grande"],
      default: "mediano"
    },
    modoColor: {
      type: String,
      enum: ["claro", "oscuro", "alto-contraste"],
      default: "claro"
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Usuario", UsuarioSchema);