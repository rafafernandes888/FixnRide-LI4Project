import api from './api';

export const encomendaClienteService = {
    criarReserva: async (itens) => {
        // itens: [{ pecaEAN, quantidade, precoUnitario }]
        const response = await api.post('/EncomendaCliente', {
            Itens: itens.map(i => ({
                PecaEAN:       i.pecaEAN,
                Quantidade:    i.quantidade,
                PrecoUnitario: i.precoUnitario,
            })),
        });
        return response.data;
    },

    listarMinhasReservas: async () => {
        const response = await api.get('/EncomendaCliente');
        return response.data;
    },
};