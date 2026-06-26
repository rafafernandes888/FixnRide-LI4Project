const express = require('express');
const router = express.Router();
const vendaController = require('../../controllers/financeControllers/vendaController');
const verificarToken = require('../../middlewares/authMiddleware')

router.post('/',verificarToken, vendaController.criarVenda);
router.get('/',verificarToken, vendaController.listarVendas);
router.get('/:id',verificarToken, vendaController.obterVenda);
router.put('/:id',verificarToken, vendaController.atualizarVenda);
router.delete('/:id',verificarToken, vendaController.eliminarVenda);

module.exports = router;