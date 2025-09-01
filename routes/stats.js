const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const auth = require('../middleware/auth');

// GET /api/stats/summary
router.get('/summary', auth, async (req, res) => {
    try {
        // 1. Contadores generales
        const totalPedidos = await Pedido.countDocuments();
        const totalUsuarios = await Usuario.countDocuments({ rol: 'Cliente' });
        const totalProductos = await Producto.countDocuments();
        const pedidosPendientes = await Pedido.countDocuments({ estado: 'Pendiente' }); // <-- NUEVO

        // 2. Calcular los 5 productos más pedidos
        const topProductos = await Pedido.aggregate([
            { $unwind: '$items' }, // "Desarma" el array de items
            {
                $group: { // Agrupa por nombre de item y suma las cantidades
                    _id: '$items.nombre',
                    totalVendido: { $sum: '$items.cantidad' }
                }
            },
            { $sort: { totalVendido: -1 } }, // Ordena de mayor a menor
            { $limit: 5 }, // Se queda con los 5 primeros
            { 
                $project: { // Cambia el formato del resultado final
                    name: '$_id',
                    total: '$totalVendido',
                    _id: 0
                }
            }
        ]);
        
        // 3. Obtener los 5 pedidos más recientes
        const pedidosRecientes = await Pedido.find().sort({ createdAt: -1 }).limit(5);

        // 4. Enviar todos los datos calculados
        res.json({
            totalPedidos,
            totalUsuarios,
            totalProductos,
            pedidosPendientes, // <-- NUEVO
            topProductos,      // <-- NUEVO
            pedidosRecientes
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;