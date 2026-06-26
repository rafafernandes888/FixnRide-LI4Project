import api from './api';

export const faturaService = {
    getFaturaDeCliente: async() => {
        const response = await api.get(`/Faturas/minhas`);
        console.log(response);
        return response.data;
    }
}