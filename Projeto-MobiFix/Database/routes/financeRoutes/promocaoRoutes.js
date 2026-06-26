const express = require('express');
const router = express.Router();
const promocaoController = require('../../controllers/financeControllers/promocaoController');
const verificarToken = require('../../middlewares/authMiddleware')

router.post('/',verificarToken, promocaoController.criarPromocao);
router.get('/',verificarToken, promocaoController.listarPromocoes);
router.get('/:id',verificarToken, promocaoController.obterPromocao);
router.put('/:id',verificarToken, promocaoController.atualizarPromocao);
router.patch('/:id/estado',verificarToken, promocaoController.alterarEstadoPromocao);
router.delete('/:id',verificarToken, promocaoController.eliminarPromocao);

module.exports = router;