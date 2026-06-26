import api from './api';

/**
 * Camada de serviço dedicada ao Operador (FixNSell).
 * Isola toda a comunicação HTTP do operador — as páginas
 * consomem apenas os hooks em `hooks/useOperator.js`.
 *
 * Endpoints disponibilizados pelo backend:
 * - GET  /api/pecas
 * - GET  /api/Encomendas/stock
 * - PUT  /api/Encomendas/stock/:id
 * - GET  /api/faturas
 * - POST /api/vendas/direta
 * - GET  /api/EncomendaCliente/prontas
 * - PUT  /api/EncomendaCliente/:id/levantar
 * - GET  /api/servicos/prontas
 * - PUT  /api/servicos/:id/fechar
 */
export const operatorService = {
    // ---------- Catálogo ----------
    listarPecas: async () => {
        const response = await api.get('/pecas');
        return response.data;
    },

    // ---------- Encomendas de Stock ----------
    listarEncomendasStock: async () => {
        const response = await api.get('/Encomendas/stock');
        return response.data;
    },

    confirmarRececaoEncomenda: async (id, operadorNumero) => {
        const response = await api.put(`/Encomendas/stock/${id}`, {
            Estado: 'RECECIONADA',
            OperadorRececaoNumero: operadorNumero,
        });
        return response.data;
    },

    // ---------- Faturação ----------
    listarFaturas: async () => {
        const response = await api.get('/faturas');
        return response.data;
    },

    devolverFatura: async ({ numero, motivo }) => {
        const response = await api.post(
            `/faturas/${encodeURIComponent(numero)}/devolucao`,
            { Motivo: motivo },
        );
        return response.data;
    },

    // ---------- Venda Direta (cria Venda + Fatura num único passo) ----------
    registarVendaDireta: async (dados) => {
        const response = await api.post('/vendas/direta', dados);
        return response.data; // { Venda, Fatura }
    },

    // ---------- Levantamentos ----------
    
    listarTrotinetesProntas: async () => {
        const response = await api.get('/servicos/prontas');
        return response.data;
    },

    levantarTrotinete: async ({ id, metodoPagamento }) => {
        // Emite fatura do serviço + fecha num único passo (atómico no backend)
        const response = await api.put(`/servicos/${id}/levantar`, {
            MetodoPagamento: metodoPagamento,
        });
        return response.data; // { Fatura }
    },

    listarPecasReservadas: async () => {
        const response = await api.get('/EncomendaCliente/prontas');
        return response.data;
    },

    levantarPecaReservada: async ({ id, metodoPagamento }) => {
        const response = await api.put(`/EncomendaCliente/${id}/levantar`, {
            MetodoPagamento: metodoPagamento,
        });
        return response.data; // { mensagem, fatura }
    },
};