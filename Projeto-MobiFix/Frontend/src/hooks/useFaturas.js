import { useQuery } from "@tanstack/react-query";
import { faturaService } from "../services/faturaService";

export function useFaturas(){
    var token = localStorage.getItem("token");
    return useQuery({
        queryKey: ['faturas', token],
        queryFn: () => faturaService.getFaturaDeCliente(),
        staleTime: 1000 * 60 * 5,
    });
}