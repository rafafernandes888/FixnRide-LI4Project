namespace Backend.Services;
using Backend.Models;

public interface IFaturaService
{
    Task<IEnumerable<FaturaDto>> GetFaturasAsync();
    Task<IEnumerable<FaturaDto>> GetFaturasCliente(string id);
    Task<FaturaDto?> GetFaturaPorNumeroAsync(string numero);
    Task<FaturaDto?> CriarFaturaAsync(FaturaCriacaoDto faturaDto);
    Task<bool> EliminarFaturaAsync(string numero);
    Task<FaturaDto?> ProcessarDevolucaoAsync(string numeroFatura, string motivo);
}
