const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Necesitamos bcryptjs para encriptar
const Usuario = require('../models/Usuario');
const auth = require('../middleware/auth');

// --- OBTENER TODOS LOS USUARIOS ---
router.get('/', auth, async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password'); // Excluimos la contraseña de la respuesta
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CREAR UN NUEVO USUARIO (POR UN ADMIN) ---
router.post('/', auth, async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  // Verificamos que se haya enviado una contraseña
  if (!password) {
    return res.status(400).json({ message: 'La contraseña es obligatoria para nuevos usuarios.' });
  }

  try {
    let usuario = await Usuario.findOne({ correo });
    if (usuario) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    usuario = new Usuario({ nombre, correo, password, rol });

    // Encriptamos la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    
    await usuario.save();
    
    // Devolvemos el usuario sin la contraseña
    const userResponse = usuario.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- ACTUALIZAR UN USUARIO ---
router.put('/:id', auth, async (req, res) => {
  const { nombre, correo, rol, password } = req.body;
  const updateData = { nombre, correo, rol };

  try {
    // Si se envía una nueva contraseña en la petición, la encriptamos y la añadimos a los datos a actualizar
    if (password && password.length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Usamos $set para actualizar solo los campos enviados
      { new: true }
    ).select('-password'); // Excluimos la contraseña de la respuesta

    if (!usuarioActualizado) {
        return res.status(404).json({ message: 'No se encontró el usuario' });
    }
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- ELIMINAR UN USUARIO ---
router.delete('/:id', auth, async (req, res) => {
    // ... (esta ruta no cambia)
});

module.exports = router;