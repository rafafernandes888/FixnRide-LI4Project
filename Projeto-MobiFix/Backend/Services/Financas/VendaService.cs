namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class VendaService : IVendaService
{
    private readonly HttpClient _httpClient;
    private readonly IPecaService _pecaService;
    private readonly IEncomendaStockService _encomendaStockService;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public VendaService(
        HttpClient httpClient,
        IPecaService pecaService,
        IEncomendaStockService encomendaStockService)
    {
        _httpClient = httpClient;
        _pecaService = pecaService;
        _encomendaStockService = encomendaStockService;
    }

    public async Task<IEnumerable<VendaDto>> ListarVendasAsync()
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<VendaDto>>("api/vendas", _options)
               ?? Enumerable.Empty<VendaDto>();
    }

    public async Task<VendaDto?> ObterVendaAsync(int id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<VendaDto>($"api/vendas/{id}", _options);
        }
        catch { return null; }
    }

    public async Task<VendaComFaturaDto?> RegistarVendaDiretaAsync(string operadorNumero, CheckoutVendaDiretaDto dto)
    {
        // Recalcula o total no servidor a partir dos itens — não confia no frontend
        var totalCalculado = dto.ItensVenda.Sum(i => i.PrecoUnitario * i.Quantidade);

        // 1) criar a Venda (regista itens + operador autenticado)
        var vendaPayload = new
        {
            VendaID        = Random.Shared.Next(10, int.MaxValue),
            OperadorNumero = operadorNumero,
            Total          = totalCalculado,
            ItensVenda     = dto.ItensVenda.Select(i => new
            {
                PecaEAN    = i.PecaEAN,
                Quantidade = i.Quantidade
            })
        };

        var vendaResponse = await _httpClient.PostAsJsonAsync("api/vendas", vendaPayload, _options);
        if (!vendaResponse.IsSuccessStatusCode) return null;

        var venda = await vendaResponse.Content.ReadFromJsonAsync<VendaDto>(_options);
        if (venda is null) return null;

        // 2) criar a Fatura ligada à Venda
        var faturaPayload = new
        {
            NumeroFatura    = dto.NumeroFatura,
            ClienteNIF      = string.IsNullOrWhiteSpace(dto.ClienteNIF) ? "000000000" : dto.ClienteNIF,
            VendaID         = (int?)venda.VendaID,
            ValorTotal      = totalCalculado,
            MetodoPagamento = dto.MetodoPagamento
        };

        var faturaResponse = await _httpClient.PostAsJsonAsync("api/faturas", faturaPayload, _options);
        if (!faturaResponse.IsSuccessStatusCode) return null;

        var fatura = await faturaResponse.Content.ReadFromJsonAsync<FaturaDto>(_options);
        if (fatura is null) return null;

        // 3) Abater stock de cada peça + disparar reposição automática
        foreach (var item in dto.ItensVenda)
        {
            var peca = await _pecaService.GetPecaPorEanAsync(item.PecaEAN);
            if (peca is null) continue;

            peca.StockAtual -= item.Quantidade;
            if (peca.StockAtual < 0) peca.StockAtual = 0;

            await _pecaService.AtualizarPecaAsync(item.PecaEAN, peca);
            await VerificarEReporStockAsync(peca);
        }

        return new VendaComFaturaDto { Venda = venda, Fatura = fatura };
    }

    private async Task VerificarEReporStockAsync(PecaDto peca)
    {
        try
        {
            if (peca.StockAtual > peca.StockMinimo) return;

            var quantidade = peca.PadraoReposicao > 0 ? peca.PadraoReposicao : 5;

            var encomendas = await _encomendaStockService.GetEncomendasAsync();
            var jaExisteAberta = encomendas.Any(e =>
                string.Equals(e.PecaEAN, peca.CodigoEAN, StringComparison.OrdinalIgnoreCase) &&
                (string.Equals(e.Estado, "PENDENTE", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(e.Estado, "TRANSITO", StringComparison.OrdinalIgnoreCase)));

            if (jaExisteAberta)
            {
                Console.WriteLine($"[AutoReposicao] Peça {peca.CodigoEAN} abaixo do mínimo mas já tem encomenda aberta — ignorado.");
                return;
            }

            var criada = await _encomendaStockService.CriarEncomendaAsync(new EncomendaStockCriacaoDto
            {
                PecaEAN = peca.CodigoEAN,
                Quantidade = quantidade,
                AdminValidadorNumero = null
            });

            Console.WriteLine(criada is null
                ? $"[AutoReposicao] Falha ao criar encomenda para {peca.CodigoEAN}."
                : $"[AutoReposicao] Encomenda #{criada.EncomendaID} criada ({quantidade}x {peca.CodigoEAN}).");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AutoReposicao] Erro ao processar {peca.CodigoEAN}: {ex.Message}");
        }
    }
}
