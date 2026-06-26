namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class EncomendaStockService : IEncomendaStockService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public EncomendaStockService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<EncomendaStockDto>> GetEncomendasAsync()
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<EncomendaStockDto>>("api/encomendas-stock", _options)
               ?? Enumerable.Empty<EncomendaStockDto>();
    }

    public async Task<EncomendaStockDto?> GetEncomendaPorIdAsync(int id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<EncomendaStockDto>($"api/encomendas-stock/{id}", _options);
        }
        catch { return null; }
    }

    public async Task<EncomendaStockDto?> CriarEncomendaAsync(EncomendaStockCriacaoDto dto)
    {
        var payload = new
        {
            EncomendaID = Random.Shared.Next(10, int.MaxValue),
            PecaEAN = dto.PecaEAN,
            Quantidade = dto.Quantidade,
            Estado = "PENDENTE",
            AdminValidadorNumero = dto.AdminValidadorNumero ?? "ADM000"
        };

        var response = await _httpClient.PostAsJsonAsync("api/encomendas-stock", payload, _options);
        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<EncomendaStockDto>(_options);
    }

    public async Task<EncomendaStockDto?> AtualizarEncomendaAsync(int id, EncomendaStockAtualizacaoDto dto)
    {
    // 1. Verificar se a encomenda está a ser dada como recebida
    bool isRececionada = dto.Estado?.ToUpper() == "RECECIONADA" || dto.Estado?.ToUpper() == "CONCLUIDA";
    EncomendaStockDto? encomendaAtual = null;

    if (isRececionada)
    {
        // Obter os dados da encomenda para saber o PecaEAN e a Quantidade
        encomendaAtual = await GetEncomendaPorIdAsync(id);
        if (encomendaAtual == null) return null; 
    }

    // 2. Prepara e envia a atualização da encomenda 
    var payload = new
    {
        Estado = dto.Estado,
        OperadorRececaoNumero = dto.OperadorRececaoNumero
    };

    var response = await _httpClient.PutAsJsonAsync($"api/encomendas-stock/{id}", payload, _options);
    if (!response.IsSuccessStatusCode) return null;

    var encomendaAtualizada = await response.Content.ReadFromJsonAsync<EncomendaStockDto>(_options);

    if (isRececionada && encomendaAtual != null)
    {
        var pecaAtualResponse = await _httpClient.GetAsync($"api/pecas/{encomendaAtual.PecaEAN}");
        
        if (pecaAtualResponse.IsSuccessStatusCode)
        {
            var pecaAtual = await pecaAtualResponse.Content.ReadFromJsonAsync<PecaDto>(_options);
            
            if (pecaAtual != null)
            {
                pecaAtual.StockAtual += encomendaAtual.Quantidade; 

                var stockResponse = await _httpClient.PutAsJsonAsync($"api/pecas/{encomendaAtual.PecaEAN}", pecaAtual, _options);
                
                if (!stockResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Aviso: Encomenda {id} rececionada, mas falha ao atualizar o stock do EAN {encomendaAtual.PecaEAN}.");
                }
            }
        }
        else
        {
             Console.WriteLine($"Aviso: Não foi possível encontrar a peça {encomendaAtual.PecaEAN} para atualizar o stock.");
        }
    }

    return encomendaAtualizada;
    }   

    public async Task<bool> EliminarEncomendaAsync(int id)
    {
        var response = await _httpClient.DeleteAsync($"api/encomendas-stock/{id}");
        return response.IsSuccessStatusCode;
    }
}
