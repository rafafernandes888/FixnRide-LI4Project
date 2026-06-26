import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorService } from '../services/operatorService';

const KEY_PECAS = ['operator', 'pecas'];
const KEY_ENCOMENDAS_STOCK = ['operator', 'encomendas-stock'];
const KEY_FATURAS = ['operator', 'faturas'];
const KEY_TROTINETES_PRONTAS = ['operator', 'trotinetes-prontas'];
const KEY_PECAS_RESERVADAS = ['operator', 'pecas-reservadas'];

export function usePecasOperator() {
    return useQuery({
        queryKey: KEY_PECAS,
        queryFn: operatorService.listarPecas,
        staleTime: 30_000,
    });
}

export function useEncomendasStockOperator() {
    return useQuery({
        queryKey: KEY_ENCOMENDAS_STOCK,
        queryFn: operatorService.listarEncomendasStock,
        staleTime: 15_000,
    });
}

export function useConfirmarRececao() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, operadorNumero }) =>
            operatorService.confirmarRececaoEncomenda(id, operadorNumero),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_ENCOMENDAS_STOCK });
            queryClient.invalidateQueries({ queryKey: KEY_PECAS });
        },
    });
}

export function useFaturasOperator() {
    return useQuery({
        queryKey: KEY_FATURAS,
        queryFn: operatorService.listarFaturas,
        staleTime: 15_000,
    });
}

export function useDevolverFatura() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operatorService.devolverFatura,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_FATURAS });
            queryClient.invalidateQueries({ queryKey: KEY_PECAS });
        },
    });
}

export function useRegistarVendaDireta() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operatorService.registarVendaDireta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_FATURAS });
            queryClient.invalidateQueries({ queryKey: KEY_PECAS });
        },
    });
}

// ---------- LEVANTAMENTOS ----------

export function useTrotinetesProntas() {
    return useQuery({
        queryKey: KEY_TROTINETES_PRONTAS,
        queryFn: operatorService.listarTrotinetesProntas,
        staleTime: 30_000,
    });
}

export function useLevantarTrotinete() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operatorService.levantarTrotinete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_TROTINETES_PRONTAS });
            queryClient.invalidateQueries({ queryKey: KEY_FATURAS });
        },
    });
}

export function usePecasReservadas() {
    return useQuery({
        queryKey: KEY_PECAS_RESERVADAS,
        queryFn: operatorService.listarPecasReservadas,
        staleTime: 30_000,
    });
}

export function useLevantarPecaReservada() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: operatorService.levantarPecaReservada,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEY_PECAS_RESERVADAS });
            queryClient.invalidateQueries({ queryKey: KEY_FATURAS });
            queryClient.invalidateQueries({ queryKey: KEY_PECAS });
            queryClient.invalidateQueries({ queryKey: KEY_ENCOMENDAS_STOCK });
        },
    });
}