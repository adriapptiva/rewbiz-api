// app.js
const express = require("express");
const connectDB = require("./config/mongodb.connect");
const cors = require("cors");  // Importa el middleware cors
const collectionRoutes = require("./routes/collectionRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Conectar a MongoDB
connectDB();

// Middleware para procesar JSON
app.use(express.json());

// Configuración básica de CORS para permitir todas las solicitudes
app.use(cors());

// Rutas para manejar las colecciones de tipos de negocio
app.use("/api/collections", collectionRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Hubo un error en el servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});
