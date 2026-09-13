// Rutas de CONTRATOS.

const express = require('express');
const router = express.Router();
const contratosController = require('../controllers/contratos.controller');

router.get('/', contratosController.listarContratos);
router.get('/:id', contratosController.obtenerContrato);
router.post('/', contratosController.crearContrato);
router.put('/:id', contratosController.actualizarContrato);
router.delete('/:id', contratosController.eliminarContrato);

// Manejo del detalle (productos) de un contrato específico
router.post('/:id/detalle', contratosController.agregarDetalle);
router.delete('/:id/detalle/:detalleId', contratosController.eliminarDetalle);

module.exports = router;
