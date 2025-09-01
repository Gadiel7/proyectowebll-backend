const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const auth = require('../middleware/auth'); // Importar el middleware

// GET: Obtener todos los productos
router.get('/', auth, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Crear un nuevo producto
router.post('/', auth, async (req, res) => {
  const producto = new Producto({
    nombre: req.body.nombre,
    precio: req.body.precio,
    stock: req.body.stock,
    categoria: req.body.categoria
  });
  try {
    const nuevoProducto = await producto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Actualizar un producto por ID
router.put('/:id', auth, async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!productoActualizado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(productoActualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Eliminar un producto por ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;