namespace Backend.Services;
using Backend.Models;

public interface IPromocaoService
{
    Task<IEnumerable<PromocaoDto>> GetPromocoesAsync();
    Task<PromocaoDto?> GetPromocaoPorIdAsync(string id);
    Task<PromocaoDto?> CriarPromocaoAsync(PromocaoCriacaoDto dto);
    Task<PromocaoDto?> AtualizarPromocaoAsync(string id, PromocaoDto dto);
    Task<PromocaoDto?> AlterarEstadoAsync(string id, bool ativa);
    Task<bool> EliminarPromocaoAsync(string id);
}
