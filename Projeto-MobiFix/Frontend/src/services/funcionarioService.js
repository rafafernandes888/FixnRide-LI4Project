import api from './api';

export const funcionarioService = {
    listarFuncionarios: async () => {
        const response = await api.get('/Funcionarios');
        return response.data;
    },

    obterFuncionario: async (numeroMecanografico) => {
        const response = await api.get(`/Funcionarios/${numeroMecanografico}`);
        return response.data;
    },

    criarFuncionario: async (dados) => {
        const response = await api.post('/Funcionarios', {
            NumeroMecanografico: dados.numeroMecanografico,
            Nome: dados.nome,
            Email: dados.email,
            Contacto: dados.contacto,
            Cargo: dados.cargo,
            PasswordHash: dados.password,
            Especialidade: dados.especialidade || null,
            Ativo: true,
        });
        return response.data;
    },

    atualizarFuncionario: async (numeroMecanografico, dados) => {
        const response = await api.put(`/Funcionarios/${numeroMecanografico}`, {
            Nome: dados.nome,
            Email: dados.email,
            Contacto: dados.contacto,
            Cargo: dados.cargo,
            Especialidade: dados.especialidade || null,
            Ativo: dados.ativo,
        });
        return response.data;
    },
};