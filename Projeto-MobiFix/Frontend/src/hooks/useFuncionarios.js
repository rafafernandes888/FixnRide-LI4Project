import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { funcionarioService } from '../services/funcionarioService';

const QUERY_KEY = ['funcionarios'];

export function useFuncionarios() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => funcionarioService.listarFuncionarios(),
    });
}

export function useCriarFuncionario() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dados) => funcionarioService.criarFuncionario(dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao criar funcionário.';
            alert(msg);
        },
    });
}

export function useAtualizarFuncionario() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ numeroMecanografico, dados }) =>
            funcionarioService.atualizarFuncionario(numeroMecanografico, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao atualizar funcionário.';
            alert(msg);
        },
    });
}