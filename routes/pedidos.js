const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const auth = require('../middleware/auth'); // Importar el middleware

// --- OBTENER TODOS LOS PEDIDOS ---
router.get('/', auth, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CREAR UN NUEVO PEDIDO ---
router.post('/', auth, async (req, res) => {
  const pedido = new Pedido({
    usuario: req.body.usuario,
    items: req.body.items,
    estado: req.body.estado
  });

  try {
    const nuevoPedido = await pedido.save();
    res.status(201).json(nuevoPedido);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- ACTUALIZAR EL ESTADO DE UN PEDIDO ---
router.put('/:id', auth, async (req, res) => {
  try {
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id, 
      { estado: req.body.estado },
      { new: true }
    );
    res.json(pedidoActualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- ELIMINAR UN PEDIDO ---
router.delete('/:id', auth, async (req, res) => {
    try {
        await Pedido.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;