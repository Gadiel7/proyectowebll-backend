const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const auth = require('../middleware/auth'); // Middleware para proteger rutas

// --- OBTENER TODOS LOS PEDIDOS ---
// GET /api/pedidos
// Protegida: Solo usuarios logueados (admins) pueden ver todos los pedidos.
router.get('/', auth, async (req, res) => {
  try {
    // Ordenamos por fecha de creación, los más nuevos primero.
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (err) {
    console.error("Error al obtener pedidos:", err.message);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- CREAR UN NUEVO PEDIDO ---
// POST /api/pedidos
// Protegida: Solo usuarios logueados (clientes) pueden crear un pedido.
router.post('/', auth, async (req, res) => {
  // Obtenemos los datos del cuerpo de la petición (lo que envía el formulario de React)
  const { tamano, crema, frutas, toppings, precioTotal } = req.body;
  
  try {
    // Creamos una nueva instancia del modelo Pedido con los datos
    const nuevoPedido = new Pedido({
      tamano,
      crema,
      frutas,
      toppings,
      precioTotal,
      user: req.user.id, // Obtenemos el ID del usuario desde el token (inyectado por el middleware 'auth')
      nombreUsuario: req.user.nombre // Y también su nombre
    });

    // Guardamos el nuevo pedido en la base de datos
    const pedidoGuardado = await nuevoPedido.save();
    
    // Respondemos con el pedido recién creado (código 201: Creado)
    res.status(201).json(pedidoGuardado);
  } catch (err) {
    console.error("Error al crear el pedido:", err.message);
    res.status(400).json({ message: 'Error al procesar el pedido. Verifique los datos enviados.' });
  }
});

// --- ACTUALIZAR EL ESTADO DE UN PEDIDO ---
// PUT /api/pedidos/:id
// Protegida: Solo usuarios logueados (admins) pueden cambiar el estado.
router.put('/:id', auth, async (req, res) => {
  try {
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      req.params.id, 
      { estado: req.body.estado }, // Solo permitimos actualizar el estado
      { new: true } // Esta opción hace que nos devuelva el documento ya actualizado
    );
    
    if (!pedidoActualizado) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    res.json(pedidoActualizado);
  } catch (err) {
    console.error("Error al actualizar el pedido:", err.message);
    res.status(400).json({ message: 'Error al actualizar el pedido.' });
  }
});

// --- ELIMINAR UN PEDIDO ---
// DELETE /api/pedidos/:id
// Protegida: Solo usuarios logueados (admins) pueden eliminar pedidos.
router.delete('/:id', async (req, res) => {
    try {
        const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);

        if (!pedidoEliminado) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        res.json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
        console.error("Error al eliminar el pedido:", err.message);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

module.exports = router;