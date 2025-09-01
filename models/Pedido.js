const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true
  },
  items: [ // Esto será un array de objetos
    {
      nombre: String,
      cantidad: Number
    }
  ],
  estado: {
    type: String,
    default: 'Pendiente' // Estado inicial de todos los pedidos
  }
}, {
  timestamps: true // Esto añade automáticamente las fechas `createdAt` y `updatedAt`
});

module.exports = mongoose.model('Pedido', pedidoSchema);