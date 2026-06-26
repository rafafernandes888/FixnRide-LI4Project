import api from './api';

export const statsService = {
    getEstatisticasGlobais: async () => {
        const response = await api.get('/Estatisticas');
        return response.data;
    },

    getEstatisticasDia: async (dia) => {
        // Se for um objeto Date, extraímos apenas a parte da data (YYYY-MM-DD)
        const dataFormatada = dia instanceof Date
            ? dia.toLocaleDateString('en-CA') // Retorna YYYY-MM-DD
            : dia;

        const response = await api.get('/Estatisticas/dia', { params: { dia: dataFormatada } });
        return response.data;
    },

    getEstatisticasIntervalo: async (inicio, fim) => {
        const formatar = (d) => d instanceof Date ? d.toLocaleDateString('en-CA') : d;

        const response = await api.get('/Estatisticas/intervalo', {
            params: {
                inicio: formatar(inicio),
                fim: formatar(fim)
            }
        });
        return response.data;
    }
};