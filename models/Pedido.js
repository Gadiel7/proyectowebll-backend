const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  // Vinculamos el pedido a un usuario específico de nuestra base de datos
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Hace referencia al modelo 'Usuario'
    required: true
  },
  // Mantenemos el nombre para mostrarlo fácilmente en el panel
  nombreUsuario: {
    type: String,
    required: true
  },
  // Nuevos campos del formulario
  tamano: { type: String, required: true },
  crema: { type: String, required: true },
  frutas: [String], // Un array de strings, ej: ["fresas", "banano"]
  toppings: [String], // ej: ["chispas-chocolate"]
  precioTotal: { type: Number, required: true },
  estado: {
    type: String,
    default: 'Pendiente'
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

module.exports = mongoose.model('Pedido', pedidoSchema);