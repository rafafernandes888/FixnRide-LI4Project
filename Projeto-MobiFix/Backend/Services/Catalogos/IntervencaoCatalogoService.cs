namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class IntervencaoCatalogoService : IIntervencaoCatalogoService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public IntervencaoCatalogoService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<IntervencaoCatalogoDto>> ListarTodasAsync(string? especialidade)
    {
        var url = "api/intervencoes-catalogo";
        if (!string.IsNullOrWhiteSpace(especialidade))
            url += $"?especialidade={Uri.EscapeDataString(especialidade)}";

        return await _httpClient.GetFromJsonAsync<IEnumerable<IntervencaoCatalogoDto>>(url, _options)
               ?? Enumerable.Empty<IntervencaoCatalogoDto>();
    }

    public async Task<IntervencaoCatalogoDto?> ObterPorIdAsync(int id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<IntervencaoCatalogoDto>(
                $"api/intervencoes-catalogo/{id}", _options);
        }
        catch { return null; }
    }

    public async Task<IntervencaoCatalogoDto?> CriarAsync(IntervencaoCatalogoCriacaoDto dto)
    {
        var payload = new
        {
            IntervencaoID      = Random.Shared.Next(1, int.MaxValue),
            Descricao          = dto.Descricao,
            PrecoFixoMaoDeObra = dto.PrecoFixoMaoDeObra,
            Especialidade      = dto.Especialidade
        };

        var response = await _httpClient.PostAsJsonAsync("api/intervencoes-catalogo", payload, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<IntervencaoCatalogoDto>(_options);
    }

    public async Task<IntervencaoCatalogoDto?> AtualizarAsync(int id, IntervencaoCatalogoCriacaoDto dto)
    {
        var response = await _httpClient.PutAsJsonAsync(
            $"api/intervencoes-catalogo/{id}", dto, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<IntervencaoCatalogoDto>(_options);
    }

    public async Task<bool> EliminarAsync(int id)
    {
        var response = await _httpClient.DeleteAsync($"api/intervencoes-catalogo/{id}");
        return response.IsSuccessStatusCode;
    }
}