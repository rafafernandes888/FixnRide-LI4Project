namespace Backend.Services;

using Backend.Models;

public interface IAgendaService
{
    Task<IEnumerable<AgendaDto>> ListarAgendaAsync();
    Task<AgendaDto?> ObterSlotPorIdAsync(int id);
    Task<AgendaDto?> CriarSlotAsync(AgendaCriacaoDto dto);
    Task<bool> EliminarSlotAsync(int id);
    Task<AgendaDto?> AtualizarSlotAsync(int id, AgendaDto dto);
}