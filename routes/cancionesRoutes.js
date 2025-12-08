const express = require('express');
const router = express.Router(); // Gestion de las rutas
const cancionesController = require('../controllers/cancionesController.js');

router.get('/', cancionesController.consultar);

router.post('/', cancionesController.insertar);

router.route('/:id')
    .get(cancionesController.consultarDetalle)
    .put(cancionesController.actualizar)
    .delete(cancionesController.eliminar)
    .patch(cancionesController.actualizarPatch);

module.exports = router;