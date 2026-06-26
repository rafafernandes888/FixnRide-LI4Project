const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
// Controllers para Auth do Sistema (Login)
const funcionarioController = require('../controllers/userControllers/funcionarioController');
const clienteController = require('../controllers/userControllers/clienteController');

// --- Users ---
const funcionarioRoutes = require('./userRoutes/funcionarioRoutes');
const clienteRoutes = require('./userRoutes/clienteRoutes');
const trotineteRoutes = require('./userRoutes/trotineteRoutes');

// --- Stocks ---
const pecaRoutes = require('./stockRoutes/pecaRoutes');
const encomendaStockRoutes = require('./stockRoutes/encomendaStockRoutes');
const encomendaClienteRoutes = require('./stockRoutes/encomendaClienteRoutes');

// --- Services ---
const intervencaoCatalogoRoutes = require('./serviceRoutes/intervencaoCatalogoRoutes');
const servicoRoutes = require('./serviceRoutes/servicoRoutes'); 
const agendaRoutes = require('./serviceRoutes/agendaRoutes');

// --- Finance ---
const vendaRoutes = require('./financeRoutes/vendaRoutes');
const faturaRoutes = require('./financeRoutes/faturaRoutes');
const promocaoRoutes = require('./financeRoutes/promocaoRoutes');


// ==========================================
// 1. ROTAS DE SISTEMA (Públicas / Sem JWT)
// ==========================================
router.get('/auth/funcionario/:numero', funcionarioController.obterPorNumeroLogin);
router.get('/auth/cliente/:nif', clienteController.obterPorNifSistema);

// ==========================================
// 2. MIDDLEWARE GLOBAL DE AUTENTICAÇÃO (Para o futuro)
// ==========================================

// ==========================================
// 3. MAPEAMENTO DE ROTAS DE DADOS (CRUD)
// ==========================================

// Users
router.use('/funcionarios', funcionarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/trotinetes', trotineteRoutes);

// Stocks
router.use('/encomendas-stock', encomendaStockRoutes);
router.use('/encomendas-cliente', encomendaClienteRoutes);
router.use('/pecas', pecaRoutes);
// Services
router.use('/intervencoes-catalogo', intervencaoCatalogoRoutes);
router.use('/servicos', servicoRoutes);
router.use('/agenda', agendaRoutes);

// Finance
router.use('/vendas', vendaRoutes);
router.use('/faturas', faturaRoutes);
router.use('/promocoes', promocaoRoutes);

module.exports = router;