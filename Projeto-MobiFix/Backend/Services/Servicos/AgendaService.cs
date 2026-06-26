namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class AgendaService : IAgendaService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public AgendaService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<AgendaDto>> ListarAgendaAsync()
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<AgendaDto>>("api/agenda", _options)
               ?? Enumerable.Empty<AgendaDto>();
    }

    public async Task<AgendaDto?> ObterSlotPorIdAsync(int id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<AgendaDto>($"api/agenda/{id}", _options);
        }
        catch { return null; }
    }

    public async Task<AgendaDto?> CriarSlotAsync(AgendaCriacaoDto dto)
    {
        var payload = new
        {
            AgendaID      = Random.Shared.Next(10, int.MaxValue),
            MecanicoNumero = dto.MecanicoNumero,
            ServicoID     = dto.ServicoID,
            TipoSlot      = dto.TipoSlot,
            DataHoraInicio = dto.DataHoraInicio,
            IntervencaoID = 3,
            Estado        = "RESERVADO"
        };

        var response = await _httpClient.PostAsJsonAsync("api/agenda", payload, _options);

        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<AgendaDto>(_options);
    }

    public async Task<AgendaDto?> AtualizarSlotAsync(int id, AgendaDto dto)
    {
        var response = await _httpClient.PutAsJsonAsync($"api/agenda/{id}", dto, _options);
        if (!response.IsSuccessStatusCode) return null;
    
        return await response.Content.ReadFromJsonAsync<AgendaDto>(_options);
    }

    public async Task<bool> EliminarSlotAsync(int id)
    {
        var response = await _httpClient.DeleteAsync($"api/agenda/{id}");
        return response.IsSuccessStatusCode;
    }
}