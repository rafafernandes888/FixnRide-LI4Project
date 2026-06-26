import api from './api';

export const servicoService = {
    criar: async (dados) => {
        const response = await api.post('/Servicos', {
            TrotineteNumSerie: dados.trotineteNumSerie,
            FeedbackCliente: dados.descricao,
        });
        return response.data;
    },
    
    listar: async() => {
        const response = await api.get('/Servicos');
        console.log(response);
        return response.data;
    },

    atualizar: async (id, dados) => {
        const response = await api.put(`/Servicos/${id}`, dados);
        return response.data;
    }
};