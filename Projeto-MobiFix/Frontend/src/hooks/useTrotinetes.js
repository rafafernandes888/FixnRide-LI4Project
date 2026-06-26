import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trotineteService } from '../services/trotineteService';

const QUERY_KEY = ['trotinetes'];

export function useTrotinetes() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => trotineteService.listarMinhasTrotinetes(),
    });
}

export function useBuscarTrotinete(serie){
    return useQuery({
        queryKey: ['trotinetes', serie],
        queryFn:() => trotineteService.buscarTrotinete(serie),
    })
}

export function useCriarTrotinete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dados) => trotineteService.criarTrotinete(dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao registar a trotinete.';
            alert(msg);
        },
    });
}

export function useEliminarTrotinete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (numeroSerie) => trotineteService.eliminarTrotinete(numeroSerie),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao remover a trotinete.';
            alert(msg);
        },
    });
}