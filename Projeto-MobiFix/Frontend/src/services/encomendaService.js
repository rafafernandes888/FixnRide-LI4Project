import api from "./api";

export const encomendaService = {
    getEncomendasStock: async () => {
        const response = await api.get('/Encomendas/stock');
        return response.data;
    },

    criarEncomendaStock: async (dados) => {
        const response = await api.post('/Encomendas/stock', dados);
        return response.data;
    },

    atualizarEncomendaStock: async (id, dados) => {
        const response = await api.put(`/Encomendas/stock/${id}`, dados);
        return response.data;
    },

    eliminarEncomendaStock: async (id) => {
        const response = await api.delete(`/Encomendas/stock/${id}`);
        return response.data;
    },
};
