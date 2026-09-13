// Rutas de EQUIPOS.

const express = require('express');
const router = express.Router();
const equiposController = require('../controllers/equipos.controller');

router.get('/', equiposController.listarEquipos);
router.get('/:id', equiposController.obtenerEquipo);
router.post('/', equiposController.crearEquipo);
router.put('/:id', equiposController.actualizarEquipo);
router.delete('/:id', equiposController.eliminarEquipo);

module.exports = router;
