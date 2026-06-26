import api from "./api";

export const pecaService = {
    getPecas: async () => {
        const response = await api.get('/pecas');
        return response.data;
    },

    obterPeca: async (ean) => {
        const response = await api.get(`/pecas/${ean}`);
        return response.data;
    },

    criarPeca: async (dados) => {
        const response = await api.post('/pecas', dados);
        return response.data;
    },

    atualizarPeca: async (ean, dados) => {
        const response = await api.put(`/pecas/${ean}`, dados);
        return response.data;
    },

    alterarEstadoPeca: async (ean, ativo) => {
        const response = await api.patch(`/pecas/${ean}/estado`, { Ativo: ativo });
        return response.data;
    },

    uploadImagem: async (ean, file) => {
        const formData = new FormData();
        formData.append('ficheiro', file, file.name);
        const response = await api.post(`/pecas/${ean}/imagem`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    eliminarImagem: async (ean) => {
        const response = await api.delete(`/pecas/${ean}/imagem`);
        return response.data;
    },

    // Constrói a URL para mostrar a imagem (com cache-buster opcional)
    urlImagem: (ean, cacheBuster) => {
        if (!ean) return null;
        const base = `/api/pecas/${encodeURIComponent(ean)}/imagem`;
        return cacheBuster ? `${base}?v=${cacheBuster}` : base;
    },
};