const express = require('express');
const router = express.Router();
const encomendaClienteController = require('../../controllers/stockControllers/encomendaClienteController');
const verificarToken = require('../../middlewares/authMiddleware');

router.post('/', verificarToken, encomendaClienteController.criarEncomendaCliente);
router.get('/', verificarToken, encomendaClienteController.listarEncomendasCliente);
router.get('/:id', verificarToken, encomendaClienteController.obterEncomendaCliente);
router.put('/:id', verificarToken, encomendaClienteController.atualizarEncomendaCliente);
router.delete('/:id', verificarToken, encomendaClienteController.eliminarEncomendaCliente);

module.exports = router;
