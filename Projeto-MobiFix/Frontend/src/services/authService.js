import api from './api';

export const authService = {
    loginCliente: async(nif, password) => {
        const response = await api.post('/Auth/login/cliente', { nif, password });
        return response.data;
    },

    loginFuncionario: async(numeroMecanografico, password) => {
        const response = await api.post('/Auth/login/funcionario', {
            numeroMecanografico, password 
        });
        return response.data;
    },

    registoCliente: async(nome, nif, telefone, morada, email, password) => {
        const response = await api.post('/Auth/register/cliente', {
            Nome: nome, Email: email, Morada: morada, NIF: nif, Telefone: telefone, Password: password
        });
        return response.data;
    }
}