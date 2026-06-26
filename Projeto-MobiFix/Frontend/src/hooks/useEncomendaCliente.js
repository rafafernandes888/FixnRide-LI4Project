import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { encomendaClienteService } from '../services/encomendaClienteService';

const QUERY_KEY = ['encomendas-cliente'];

export function useMinhasReservas() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => encomendaClienteService.listarMinhasReservas(),
    });
}

export function useCriarReserva() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itens) => encomendaClienteService.criarReserva(itens),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao criar reserva.';
            alert(msg);
        },
    });
}