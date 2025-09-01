const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const auth = require('../middleware/auth');

// --- OBTENER TODOS LOS PEDIDOS ---
router.get('/', auth, async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    console.error("Error al obtener pedidos:", err.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- CREAR UN NUEVO PEDIDO ---
router.post('/', auth, async (req, res) => {
  const { tamano, crema, frutas, toppings, precioTotal } = req.body;
  try {
    const nuevoPedido = new Pedido({
      tamano,
      crema,
      frutas,
      toppings,
      precioTotal,
      user: req.user.id,
      nombreUsuario: req.user.nombre
    });

    const pedidoGuardado = await nuevoPedido.save();
    
    // Emitir evento a la sala de administradores
    req.io.to('admins').emit('nuevo_pedido', pedidoGuardado);
    
    res.status(201).json(pedidoGuardado);
  } catch (err) {
    console.error("Error al crear el pedido:", err.message);
    res.status(400).json({ message: 'Error al procesar el pedido. Verifique los datos enviados.' });
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
    
    if (!pedidoActualizado) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Emitir evento a la sala del usuario específico
    if (pedidoActualizado.user) {
        req.io.to(pedidoActualizado.user.toString()).emit('pedido_actualizado', pedidoActualizado);
    }
    
    res.json(pedidoActualizado);
  } catch (err) {
    console.error("Error al actualizar el pedido:", err.message);
    res.status(400).json({ message: 'Error al actualizar el pedido.' });
  }
});

// --- ELIMINAR UN PEDIDO ---
router.delete('/:id', auth, async (req, res) => {
    try {
        const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);

        if (!pedidoEliminado) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Podríamos emitir un evento de eliminación también si fuera necesario
        // req.io.to('admins').emit('pedido_eliminado', { id: req.params.id });
        
        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (err)
 {
        console.error("Error al eliminar el pedido:", err.message);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});
// routes/pedidos.js
// ...
router.put('/:id', auth, async (req, res) => {
  try {
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id, 
      { estado: req.body.estado },
      { new: true }
    );
    // ...
    if (pedidoActualizado.user) {
        // --- AÑADE ESTA LÍNEA ---
        console.log(`Emitiendo 'pedido_actualizado' a la sala: ${pedidoActualizado.user.toString()}`);
        req.io.to(pedidoActualizado.user.toString()).emit('pedido_actualizado', pedidoActualizado);
    }
    res.json(pedidoActualizado);
  } catch (err) { /* ... */ }
});
// ...
module.exports = router;