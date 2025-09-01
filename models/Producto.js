// models/Producto.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true // Quita espacios en blanco al inicio y final
  },
  precio: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0 // Si no se especifica, el stock será 0
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('Producto', productoSchema);