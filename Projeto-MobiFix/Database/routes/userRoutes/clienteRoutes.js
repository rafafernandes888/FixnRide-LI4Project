const express = require('express');
const router = express.Router();
const clienteController = require('../../controllers/userControllers/clienteController');
const verificarToken = require('../../middlewares/authMiddleware');

router.get('/', verificarToken, clienteController.listarClientes);

router.get('/:nif', verificarToken, clienteController.obterPorNif);

router.post('/', clienteController.criarCliente);

router.put('/:nif', verificarToken, clienteController.atualizarCliente);

router.delete('/:nif', verificarToken, clienteController.eliminarCliente);

module.exports = router;
