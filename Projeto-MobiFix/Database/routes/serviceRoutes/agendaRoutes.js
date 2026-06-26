const express = require('express');
const router = express.Router();
const agendaController = require('../../controllers/serviceControllers/agendaController');
const verificarToken = require('../../middlewares/authMiddleware')

router.post('/',verificarToken, agendaController.criarSlot);
router.get('/',verificarToken, agendaController.listarAgenda);
router.get('/:id',verificarToken, agendaController.obterSlot);
router.put('/:id',verificarToken, agendaController.atualizarSlot);
router.delete('/:id',verificarToken, agendaController.eliminarSlot);

module.exports = router;