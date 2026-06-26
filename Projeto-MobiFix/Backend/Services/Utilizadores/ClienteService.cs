namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class ClienteService : IClienteService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public ClienteService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ClienteDto?> ObterPorNifAsync(string nif)
    {
        if (string.IsNullOrWhiteSpace(nif)) return null;
        try
        {
            return await _httpClient.GetFromJsonAsync<ClienteDto>($"api/clientes/{nif}", _options);
        }
        catch
        {
            return null;
        }
    }
}
