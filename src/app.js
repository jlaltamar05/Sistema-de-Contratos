// Configuración central de la app Express.
// Aquí se registran los middlewares y las rutas de cada módulo.
// Cuando agreguemos "equipos", "contratos", etc., cada uno se registra
// aquí con una línea nueva, sin tocar las rutas que ya funcionan.

const express = require('express');
const cors = require('cors');

const clientesRoutes = require('./routes/clientes.routes');

const app = express();


app.use(cors());
app.use(express.json());

// Ruta de salud, para confirmar que el servidor está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Módulos de la API
app.use('/clientes', clientesRoutes);

module.exports = app;
const equiposRoutes = require('./routes/equipos.routes');
app.use('/equipos', equiposRoutes);

const lineasProductoRoutes = require('./routes/lineasProducto.routes');
app.use('/lineas-producto', lineasProductoRoutes);

const contratosRoutes = require('./routes/contratos.routes');
app.use('/contratos', contratosRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

