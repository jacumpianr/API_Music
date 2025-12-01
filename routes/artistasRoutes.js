const express = require('express');
const router = express.Router(); 
const artistasController = require('../controllers/artistasController.js');
const upload = require('../middlewares/upload.js');

router.get('/', artistasController.consultar);
router.post('/', upload.single('Fotografia'), artistasController.insertar);

router.route('/:id')
    .get(artistasController.consultarDetalle)
    .put(upload.single('Fotografia'), artistasController.actualizar)
    .delete(artistasController.eliminar);

module.exports = router;