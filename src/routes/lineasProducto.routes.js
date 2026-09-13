// Rutas de LINEAS DE PRODUCTO.

const express = require('express');
const router = express.Router();
const lineasController = require('../controllers/lineasProducto.controller');

router.get('/', lineasController.listarLineas);
router.get('/:id', lineasController.obtenerLinea);
router.post('/', lineasController.crearLinea);
router.put('/:id', lineasController.actualizarLinea);
router.delete('/:id', lineasController.eliminarLinea);

module.exports = router;
