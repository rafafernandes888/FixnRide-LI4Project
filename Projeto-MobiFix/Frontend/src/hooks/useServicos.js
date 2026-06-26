import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicoService } from '../services/servicoService';

const QUERY_KEY = ['servicos'];

export function useServicos() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => servicoService.listar(),
    });
}

export function useCriarServico() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dados) => servicoService.criar(dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao criar serviço.';
            alert(msg);
        },
    });
}

export function useAtualizarServico() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dados }) => servicoService.atualizar(id, dados),
        onSuccess: (servicoAtualizado) => {
            // 1. Atualização otimista/manual na cache
            queryClient.setQueryData(QUERY_KEY, (velhosServicos) => {
                if (!velhosServicos) return [];
                // Substitui o serviço antigo pelo recém-atualizado
                return velhosServicos.map(servico => 
                    servico.ServicoID === servicoAtualizado.ServicoID ? servicoAtualizado : servico
                );
            });

            // 2. Refetch em background para garantir 100% de sincronia
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (error) => {
            const msg = error.response?.data?.mensagem || 'Erro ao atualizar serviço.';
            alert(msg);
        },
    });
}