namespace Backend.Services;

using Backend.Models;

public interface IEstatisticasService
{
    Task<EstatisticaDto> GetEstatisticaDiaAsync(DateTime dia);
    Task<EstatisticaDto> GetIntervaloEstatisticaAsync(DateTime inicio, DateTime fim);
    Task<EstatisticaDto> GetEstatisticasAsync();
}
