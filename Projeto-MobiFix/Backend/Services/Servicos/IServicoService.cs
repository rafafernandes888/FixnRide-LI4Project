namespace Backend.Services;

using Backend.Models;

public interface IServicoService
{
    Task<IEnumerable<ServicoDto>> ListarTodosAsync();
    Task<ServicoDto?> ObterPorIdAsync(int id);
    Task<ServicoDto?> CriarServicoDiagnosticoAsync(ServicoCriacaoDto dto);
    Task<bool> AtualizarEstadoAsync(int id, string novoEstado);
    Task<ServicoDto?> AtualizarServicoAsync(int id, ServicoAtualizacaoDto dto);
    Task<IEnumerable<TrotineteProntaDto>> ListarProntasAsync();
    Task<bool> FecharServicoAsync(int id);
    Task<LevantamentoComFaturaDto?> LevantarComFaturaAsync(int id, string metodoPagamento);
}