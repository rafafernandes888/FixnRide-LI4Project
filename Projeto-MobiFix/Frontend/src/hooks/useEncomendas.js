import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { encomendaService } from "../services/encomendaService";

export function useEncomendaStock() {
    return useQuery({
        queryKey: ['encomendas_stock'],
        queryFn: encomendaService.getEncomendasStock,
        staleTime: 1,
    });
}

export function useCriarEncomendaStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: encomendaService.criarEncomendaStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encomendas_stock'] });
        },
    });
}

export function useAtualizarEncomendaStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dados }) => encomendaService.atualizarEncomendaStock(id, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encomendas_stock'] });
        },
    });
}

export function useEliminarEncomendaStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => encomendaService.eliminarEncomendaStock(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encomendas_stock'] });
        },
    });
}
