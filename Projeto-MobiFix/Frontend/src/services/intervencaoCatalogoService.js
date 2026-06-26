import api from './api';

export const intervencaoCatalogoService = {
    listar: async (especialidade) => {
        const params = especialidade ? `?especialidade=${especialidade}` : '';
        const response = await api.get(`/IntervencoesCatalogo${params}`);
        return response.data;
    },

    obterPorId: async (id) => {
        const response = await api.get(`/IntervencoesCatalogo/${id}`);
        return response.data;
    },

    criar: async (dados) => {
        const response = await api.post('/IntervencoesCatalogo', {
            Descricao:          dados.descricao,
            PrecoFixoMaoDeObra: dados.precoFixoMaoDeObra,
            Especialidade:      dados.especialidade || null,
        });
        return response.data;
    },

    atualizar: async (id, dados) => {
        const response = await api.put(`/IntervencoesCatalogo/${id}`, {
            Descricao:          dados.descricao,
            PrecoFixoMaoDeObra: dados.precoFixoMaoDeObra,
            Especialidade:      dados.especialidade || null,
        });
        return response.data;
    },

    eliminar: async (id) => {
        await api.delete(`/IntervencoesCatalogo/${id}`);
    },
};