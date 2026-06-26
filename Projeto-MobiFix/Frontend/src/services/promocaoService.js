import api from "./api";

export const promocaoService = {
    getPromocoes: async () => {
        const response = await api.get('/promocoes');
        return response.data;
    },

    obterPromocao: async (id) => {
        const response = await api.get(`/promocoes/${id}`);
        return response.data;
    },

    criarPromocao: async (dados) => {
        const response = await api.post('/promocoes', dados);
        return response.data;
    },

    atualizarPromocao: async (id, dados) => {
        const response = await api.put(`/promocoes/${id}`, dados);
        return response.data;
    },

    alterarEstado: async (id, ativa) => {
        const response = await api.patch(`/promocoes/${id}/estado`, { Ativa: ativa });
        return response.data;
    },

    eliminarPromocao: async (id) => {
        const response = await api.delete(`/promocoes/${id}`);
        return response.data;
    },
};
