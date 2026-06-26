namespace Backend.Services;
using Backend.Models;

public interface IEncomendaStockService
{
    Task<IEnumerable<EncomendaStockDto>> GetEncomendasAsync();
    Task<EncomendaStockDto?> GetEncomendaPorIdAsync(int id);
    Task<EncomendaStockDto?> CriarEncomendaAsync(EncomendaStockCriacaoDto dto);
    Task<EncomendaStockDto?> AtualizarEncomendaAsync(int id, EncomendaStockAtualizacaoDto dto);
    Task<bool> EliminarEncomendaAsync(int id);
}
