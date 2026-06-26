import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useLoginCliente(){
    return useMutation({
        mutationFn: ({nif, password}) => authService.loginCliente(nif, password),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);

            console.log('Login efetuado com sucesso!');
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "Erro ao fazer login";
            alert(msg);
        }
    });
}

export function useLoginFuncionario() {
    return useMutation({
        mutationFn: ({numeroMecanografico, password}) => authService.loginFuncionario(numeroMecanografico, password),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);

            console.log(data);

            console.log('Login de funcionário efetuado com sucesso');
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "Erro ao fazer login do funcionário";
            alert(msg);
        }
    })
}

export function useRegistoCliente() {
    return useMutation({
        mutationFn: (data) => authService.registoCliente(
            data.nome,
            data.nif, 
            data.telefone,
            data.morada,
            data.email,
            data.password
        ),
        onSuccess: () => {
            console.log('Registo efetuado com sucesso!');
        },
        onError: (error) => {
            const msg = error.response?.data?.message || "Erro ao criar conta";
            alert(msg);
        }
    });
}