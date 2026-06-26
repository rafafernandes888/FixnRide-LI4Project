const express = require('express');
const router = express.Router();
const controller = require('../../controllers/serviceControllers/intervencaoCatalogoController');
const verificarToken = require('../../middlewares/authMiddleware')

router.post('/',verificarToken, controller.criarIntervencao);
router.get('/',verificarToken, controller.listarIntervencoes);
router.get('/:id',verificarToken, controller.obterPorId);
router.put('/:id',verificarToken, controller.atualizarIntervencao);
router.delete('/:id',verificarToken, controller.eliminarIntervencao);
module.exports = router;