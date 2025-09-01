const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const usuarioRoutes = require('./routes/usuarios');
const pedidoRoutes = require('./routes/pedidos');
const productoRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURACIÓN DE CORS SIMPLIFICADA PARA DEPURACIÓN ---
// Esta configuración permite peticiones desde cualquier origen.
// Es la forma más fácil de descartar problemas de CORS.
app.use(cors());
// --------------------------------------------------------

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conexión a MongoDB exitosa'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
  
app.get('/', (req, res) => {
  res.send('API de Fresas con Crema funcionando!');
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});