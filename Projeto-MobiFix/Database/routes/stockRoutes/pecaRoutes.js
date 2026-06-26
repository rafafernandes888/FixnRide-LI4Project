const express = require('express');
const router = express.Router();
const controller = require('../../controllers/stockControllers/pecaController')
const imagemController = require('../../controllers/stockControllers/pecaImagemController')
const verificarToken = require('../../middlewares/authMiddleware')

// Limite e tipos aceites para upload de imagens de peças
const uploadImagemBody = express.raw({
    type: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    limit: '5mb'
});

router.get('/', controller.listarPecas);
router.get('/:ean', controller.obterPorEan);
router.put('/:ean', verificarToken, controller.atualizarPeca);
router.post('/', verificarToken, controller.criarPeca);
router.patch('/:ean/estado', verificarToken, controller.alterarEstadoPeca);

// Imagem associada à peça (binário gerido em disco; metadado guardado no doc)
router.get('/:ean/imagem', imagemController.obterImagem);
router.post('/:ean/imagem', verificarToken, uploadImagemBody, imagemController.uploadImagem);
router.delete('/:ean/imagem', verificarToken, imagemController.eliminarImagem);

module.exports = router;