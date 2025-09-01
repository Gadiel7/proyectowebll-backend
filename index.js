const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar todas las rutas
const usuarioRoutes = require('./routes/usuarios');
const pedidoRoutes = require('./routes/pedidos');
const productoRoutes = require('./routes/productos');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');

const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexiones desde cualquier origen.
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Configuración de CORS para Express
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conexión a MongoDB exitosa'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Middleware para pasar la instancia `io` a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Fresas con Crema funcionando!');
});

// Usar todas las rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/stats', statsRoutes);

// Lógica de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Un usuario se ha conectado:', socket.id);

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    console.log(`Usuario ${socket.id} se unió a la sala: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Un usuario se ha desconectado:', socket.id);
  });
});

// Iniciar el servidor HTTP
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});