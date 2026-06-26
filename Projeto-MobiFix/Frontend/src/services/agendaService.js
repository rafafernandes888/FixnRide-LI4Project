import api from "./api";

export const agendaService = {
    // Nome corrigido: era "createAgenda", o hook chamava "criarSlot"
    criarSlot: async (dados) => {
        const response = await api.post('/Agenda', {
            ServicoID: dados.servicoID,
            DataHoraInicio: dados.dataHoraInicio,
            TipoSlot: dados.tipoSlot,
            MecanicoNumero: dados.mecanicoNumero ?? '',
        });
        return response.data;
    },

    getAgendas: async() => {
        const response = await api.get('/Agenda');
        console.log(response);
        return response.data;
    },

   atualizarSlot: async (id, dados) => {
        const response = await api.put(`/Agenda/${id}`, dados);
        return response.data;
    }, 

    getAgendaMecanico: async (mecanicoId) => {
        const response = await api.get(`/Agenda/mecanico/${mecanicoId}`);
        return response.data;
    },
};