import api from './api';

export const trotineteService = {
    // O token JWT já identifica o cliente — não precisamos passar o NIF manualmente
    listarMinhasTrotinetes: async () => {
        const response = await api.get('/Trotinetes');
        return response.data;
    },

    buscarTrotinete: async (serie) => {
        const response = await api.get(`/Trotinetes/${serie}`);
        console.log(response);
        return response.data;
    },

    criarTrotinete: async (dados) => {
        const response = await api.post('/Trotinetes', {
            NumeroSerie: dados.numeroSerie,
            Marca: dados.marca,
            Modelo: dados.modelo,
        });
        return response.data;
    },

    eliminarTrotinete: async (numeroSerie) => {
        await api.delete(`/Trotinetes/${numeroSerie}`);
    },
};