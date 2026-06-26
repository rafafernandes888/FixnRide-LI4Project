const express = require('express');
const router = express.Router();
const encomendaStockController = require('../../controllers/stockControllers/encomendaStockController');
const verificarToken = require('../../middlewares/authMiddleware');

router.post('/', verificarToken, encomendaStockController.criarEncomenda);
router.get('/', verificarToken, encomendaStockController.listarEncomendas);
router.get('/:id', verificarToken, encomendaStockController.obterEncomenda);
router.put('/:id', verificarToken, encomendaStockController.atualizarEncomenda);
router.delete('/:id', verificarToken, encomendaStockController.eliminarEncomenda);

module.exports = router;
