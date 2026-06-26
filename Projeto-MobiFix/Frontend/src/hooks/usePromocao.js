import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promocaoService } from "../services/promocaoService";

export function usePromocoes() {
    return useQuery({
        queryKey: ['promocoes'],
        queryFn: promocaoService.getPromocoes,
        staleTime: 1,
    });
}

export function useCriarPromocao() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: promocaoService.criarPromocao,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promocoes'] });
        },
    });
}

export function useAtualizarPromocao() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dados }) => promocaoService.atualizarPromocao(id, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promocoes'] });
        },
    });
}

export function useAlterarEstadoPromocao() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ativa }) => promocaoService.alterarEstado(id, ativa),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promocoes'] });
        },
    });
}

export function useEliminarPromocao() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => promocaoService.eliminarPromocao(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promocoes'] });
        },
    });
}
