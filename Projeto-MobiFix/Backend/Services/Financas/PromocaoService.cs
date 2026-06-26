namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class PromocaoService : IPromocaoService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public PromocaoService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<PromocaoDto>> GetPromocoesAsync()
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<PromocaoDto>>("api/promocoes", _options)
               ?? Enumerable.Empty<PromocaoDto>();
    }

    public async Task<PromocaoDto?> GetPromocaoPorIdAsync(string id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<PromocaoDto>($"api/promocoes/{id}", _options);
        }
        catch { return null; }
    }

    public async Task<PromocaoDto?> CriarPromocaoAsync(PromocaoCriacaoDto dto)
    {
        var response = await _httpClient.PostAsJsonAsync("api/promocoes", dto, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<PromocaoDto>(_options);
    }

    public async Task<PromocaoDto?> AtualizarPromocaoAsync(string id, PromocaoDto dto)
    {
        var response = await _httpClient.PutAsJsonAsync($"api/promocoes/{id}", dto, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<PromocaoDto>(_options);
    }

    public async Task<PromocaoDto?> AlterarEstadoAsync(string id, bool ativa)
    {
        var response = await _httpClient.PatchAsJsonAsync($"api/promocoes/{id}/estado", new { ativa }, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<PromocaoDto>(_options);
    }

    public async Task<bool> EliminarPromocaoAsync(string id)
    {
        var response = await _httpClient.DeleteAsync($"api/promocoes/{id}");
        return response.IsSuccessStatusCode;
    }
}
