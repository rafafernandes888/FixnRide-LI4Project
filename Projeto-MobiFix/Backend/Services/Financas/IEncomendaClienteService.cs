namespace Backend.Services;

using Backend.Models;

public interface IEncomendaClienteService
{
    Task<EncomendaClienteDto?> CriarEncomendaAsync(string clienteNIF, EncomendaClienteCriacaoDto dto);
    Task<IEnumerable<EncomendaClienteDto>> ListarEncomendasClienteAsync(string clienteNIF);
    Task<IEnumerable<PecaReservadaDto>> ListarProntasParaLevantamentoAsync();
    Task<bool> MarcarComoLevantadaAsync(int id);
    Task<FaturaDto?> LevantarComFaturaAsync(int id, string metodoPagamento);
}