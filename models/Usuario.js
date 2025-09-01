const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    required: true,
    default: 'Cliente'
  },
  // --- CAMPOS NUEVOS PARA RECUPERAR CONTRASEÑA ---
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);