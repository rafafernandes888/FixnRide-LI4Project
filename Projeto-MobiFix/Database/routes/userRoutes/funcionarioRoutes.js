const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/userControllers/funcionarioController');
const verificarToken = require('../../middlewares/authMiddleware');

router.get('/', verificarToken, ctrl.listarFuncionarios);
router.post('/', verificarToken, ctrl.criarFuncionario);
router.put('/:numero', verificarToken, ctrl.atualizarFuncionario);
router.get('/:numero', ctrl.fetchFuncionario);
router.delete('/:numero', verificarToken, ctrl.eliminarFuncionario);

module.exports = router;
