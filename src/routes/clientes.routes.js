// Rutas de CLIENTES.
// Conecta cada endpoint HTTP con su función correspondiente del controlador.

const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');

router.get('/', clientesController.listarClientes);
router.get('/:id', clientesController.obtenerCliente);
router.post('/', clientesController.crearCliente);
router.put('/:id', clientesController.actualizarCliente);
router.delete('/:id', clientesController.eliminarCliente);

module.exports = router;
