// Rutas de PAGOS.

const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagos.controller');

router.get('/', pagosController.listarPagos);
router.get('/:id', pagosController.obtenerPago);
router.post('/', pagosController.crearPago);
router.post('/generar/:contratoId', pagosController.generarCuotas);
router.put('/:id/pagar', pagosController.marcarComoPagado);
router.put('/:id', pagosController.actualizarPago);
router.delete('/:id', pagosController.eliminarPago);

module.exports = router;
