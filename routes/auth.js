const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Usuario = require('../models/Usuario');

// --- RUTA DE REGISTRO ---
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;
    let usuario = await Usuario.findOne({ correo });
    if (usuario) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }
    usuario = new Usuario({ nombre, correo, password, rol });
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    await usuario.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// --- RUTA DE LOGIN ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas.' });
    }
    const payload = {
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// --- RUTA PARA SOLICITAR RECUPERACIÓN DE CONTRASEÑA ---
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { correo } = req.body;
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(200).json({ message: 'Si el correo está registrado, se enviará un enlace de recuperación.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        
        usuario.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        usuario.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

        await usuario.save();

        const resetUrl = `https://proyectowebll.vercel.app/reset-password/${resetToken}`;
        const message = `
            <h1>Has solicitado un reseteo de contraseña</h1>
            <p>Por favor, haz clic en el siguiente enlace para resetear tu contraseña:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>Este enlace expirará en 10 minutos.</p>
        `;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `"Fresas con Crema" <${process.env.SMTP_USER}>`,
            to: usuario.correo,
            subject: 'Reseteo de Contraseña',
            html: message
        });

        res.status(200).json({ message: 'Correo de recuperación enviado.' });

    } catch (err) {
        console.error(err.message);
        if (req.body.correo) {
            const usuario = await Usuario.findOne({ correo: req.body.correo });
            if (usuario) {
                usuario.resetPasswordToken = undefined;
                usuario.resetPasswordExpire = undefined;
                await usuario.save();
            }
        }
        res.status(500).send('Error en el servidor');
    }
});

// --- RUTA PARA RESETEAR LA CONTRASEÑA CON EL TOKEN ---
// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const usuario = await Usuario.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(req.body.password, salt);
        
        usuario.resetPasswordToken = undefined;
        usuario.resetPasswordExpire = undefined;

        await usuario.save();

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;