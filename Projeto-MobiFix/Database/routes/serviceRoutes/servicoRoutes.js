const express = require('express');
const router = express.Router();
const controller = require('../../controllers/serviceControllers/servicoController');
const verificarToken = require('../../middlewares/authMiddleware')


router.post('/',verificarToken, controller.criarServico);
router.get('/',verificarToken, controller.listarServicos);
router.get('/:id',verificarToken, controller.obterServico);
router.put('/:id',verificarToken, controller.atualizarServico);
router.delete('/:id',verificarToken, controller.eliminarServico);
module.exports = router;