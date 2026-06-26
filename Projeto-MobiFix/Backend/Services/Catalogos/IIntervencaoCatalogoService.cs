namespace Backend.Services;

using Backend.Models;

public interface IIntervencaoCatalogoService
{
    Task<IEnumerable<IntervencaoCatalogoDto>> ListarTodasAsync(string? especialidade);
    Task<IntervencaoCatalogoDto?> ObterPorIdAsync(int id);
    Task<IntervencaoCatalogoDto?> CriarAsync(IntervencaoCatalogoCriacaoDto dto);
    Task<IntervencaoCatalogoDto?> AtualizarAsync(int id, IntervencaoCatalogoCriacaoDto dto);
    Task<bool> EliminarAsync(int id);
}