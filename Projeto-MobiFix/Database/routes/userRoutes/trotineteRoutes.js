const express = require('express');
const router = express.Router();
const controller = require('../../controllers/userControllers/trotineteController')
const verificarToken = require('../../middlewares/authMiddleware');

router.get('/', verificarToken, controller.listarTrotinetes);
router.get('/:numSerie', verificarToken, controller.obterPorNumSerie);
router.put('/:numSerie', verificarToken, controller.atualizarTrotinete);
router.post('/', verificarToken, controller.criarTrotinete);
router.delete('/:numSerie', verificarToken, controller.eliminarTrotinete)

module.exports = router;
