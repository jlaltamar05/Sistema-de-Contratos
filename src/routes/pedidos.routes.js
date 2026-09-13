// Rutas de PEDIDOS.

const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

router.get('/', pedidosController.listarPedidos);
router.get('/:id', pedidosController.obtenerPedido);
router.post('/', pedidosController.crearPedido);
router.put('/:id', pedidosController.actualizarPedido);
router.put('/:id/anexar', pedidosController.anexarAContrato);
router.delete('/:id', pedidosController.eliminarPedido);

module.exports = router;
