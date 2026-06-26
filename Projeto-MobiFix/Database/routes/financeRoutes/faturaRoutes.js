const express = require('express');
const router = express.Router();
const faturaController = require('../../controllers/financeControllers/faturaController');
const verificarToken = require('../../middlewares/authMiddleware')

router.post('/',verificarToken ,faturaController.criarFatura);
router.get('/',verificarToken, faturaController.listarFaturas);
router.get('/:numero',verificarToken, faturaController.obterFatura);
router.put('/:numero',verificarToken, faturaController.atualizarFatura);
router.delete('/:numero',verificarToken, faturaController.eliminarFatura);

module.exports = router;