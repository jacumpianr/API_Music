const express = require('express');
const router = express.Router(); 
const albumesController = require('../controllers/albumesController.js');

router.get('/', albumesController.consultar);

router.post('/', albumesController.insertar);

router.route('/:id')
    .get(albumesController.consultarDetalle)
    .put(albumesController.actualizar)
    .delete(albumesController.eliminar);

module.exports = router;