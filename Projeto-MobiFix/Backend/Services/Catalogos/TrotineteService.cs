namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class TrotineteService : ITrotineteService
{
    private readonly HttpClient _httpClient;

    private static readonly JsonSerializerOptions _optionsPascalCase = new JsonSerializerOptions
    {
        PropertyNamingPolicy = null
    };

    public TrotineteService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<TrotineteDto>> GetTrotinetesClienteAsync(string clienteNIF)
    {
        var trotinetes = await _httpClient.GetFromJsonAsync<IEnumerable<TrotineteDto>>(
            $"api/trotinetes?nif={clienteNIF}",
            _optionsPascalCase
        );

        return trotinetes ?? Enumerable.Empty<TrotineteDto>();
    }

    public async Task<TrotineteDto?> GetTrotineteNumeroSerie(string serie)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<TrotineteDto>(
                $"api/trotinetes/{serie}",
                _optionsPascalCase
            );
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

    public async Task<TrotineteDto?> CriarTrotineteAsync(string clienteNIF, TrotinetelCriacaoDto criacaoDto)
    {
        var payload = new
        {
            NumeroSerie = criacaoDto.NumeroSerie,
            Marca = criacaoDto.Marca,
            Modelo = criacaoDto.Modelo,
            ClienteNIF = clienteNIF,
            EmServico = false
        };

        var response = await _httpClient.PostAsJsonAsync("api/trotinetes", payload, _optionsPascalCase);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<TrotineteDto>(_optionsPascalCase);
    }

    public async Task<bool> EliminarTrotineteAsync(string clienteNIF, string numeroSerie)
    {
        // Verifica primeiro que a trotinete pertence a este cliente
        try
        {
            var trotinete = await _httpClient.GetFromJsonAsync<TrotineteDto>(
                $"api/trotinetes/{numeroSerie}",
                _optionsPascalCase
            );

            if (trotinete is null || trotinete.ClienteNIF != clienteNIF)
                return false;
        }
        catch (HttpRequestException)
        {
            return false;
        }

        var response = await _httpClient.DeleteAsync($"api/trotinetes/{numeroSerie}");
        return response.IsSuccessStatusCode;
    }
}