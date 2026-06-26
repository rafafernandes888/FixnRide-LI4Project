import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intervencaoCatalogoService } from '../services/intervencaoCatalogoService';

const QUERY_KEY = ['intervencoes-catalogo'];

export function useIntervencoesCatalogo(especialidade) {
    return useQuery({
        queryKey: [...QUERY_KEY, especialidade],
        queryFn: () => intervencaoCatalogoService.listar(especialidade),
    });
}

export function useIntervencaoCatalogo(id) {
    return useQuery({
        queryKey: [...QUERY_KEY, id],
        queryFn: () => intervencaoCatalogoService.obterPorId(id),
        enabled: !!id,
    });
}

export function useCriarIntervencaoCatalogo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dados) => intervencaoCatalogoService.criar(dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao criar intervenção.';
            alert(msg);
        },
    });
}

export function useAtualizarIntervencaoCatalogo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dados }) => intervencaoCatalogoService.atualizar(id, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao atualizar intervenção.';
            alert(msg);
        },
    });
}

export function useEliminarIntervencaoCatalogo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => intervencaoCatalogoService.eliminar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao eliminar intervenção.';
            alert(msg);
        },
    });
}