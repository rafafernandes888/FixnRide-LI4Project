namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;


public class FaturaService : IFaturaService
{
    private readonly HttpClient _httpClient;
    private readonly IPecaService _pecaService;
    private readonly IVendaService _vendaService;
    private readonly IEncomendaStockService _encomendaStockService;
    private readonly IClienteService _clienteService;
    private readonly IEmailService _emailService;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public FaturaService(
        HttpClient httpClient,
        IPecaService pecaService,
        IVendaService vendaService,
        IEncomendaStockService encomendaStockService,
        IClienteService clienteService,
        IEmailService emailService)
    {
        _httpClient = httpClient;
        _pecaService = pecaService;
        _vendaService = vendaService;
        _encomendaStockService = encomendaStockService;
        _clienteService = clienteService;
        _emailService = emailService;
    }

    public async Task<IEnumerable<FaturaDto>> GetFaturasAsync()
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<FaturaDto>>("api/faturas", _options) 
               ?? Enumerable.Empty<FaturaDto>();
    }

    public async Task<IEnumerable<FaturaDto>> GetFaturasCliente(string id)
    {
        return await _httpClient.GetFromJsonAsync<IEnumerable<FaturaDto>>($"api/faturas?nif={id}", _options)
            ?? Enumerable.Empty<FaturaDto>();
    }

    public async Task<FaturaDto?> GetFaturaPorNumeroAsync(string numero)
    {
        try 
        {
            return await _httpClient.GetFromJsonAsync<FaturaDto>($"api/faturas/{numero}", _options);
        }
        catch { return null; }
    }

public async Task<FaturaDto?> CriarFaturaAsync(FaturaCriacaoDto faturaDto)
    {
        var payloadNode = new
        {
            NumeroFatura = faturaDto.NumeroFatura,
            ClienteNIF = faturaDto.ClienteNIF,
            ServicoID = faturaDto.ServicoID,
            VendaID = faturaDto.VendaID,
            ValorTotal = faturaDto.ValorTotal,
            MetodoPagamento = faturaDto.MetodoPagamento
        };

        var response = await _httpClient.PostAsJsonAsync("api/faturas", payloadNode, _options);
        
        if (!response.IsSuccessStatusCode) 
            return null; 

        var faturaCriada = await response.Content.ReadFromJsonAsync<FaturaDto>(_options);

        if (faturaDto.ItensVenda != null && faturaDto.ItensVenda.Any())
        {
            foreach (var item in faturaDto.ItensVenda)
            {
                var peca = await _pecaService.GetPecaPorEanAsync(item.PecaEAN);

                if (peca != null)
                {
                    peca.StockAtual -= item.Quantidade;
                    if (peca.StockAtual < 0) peca.StockAtual = 0;

                    await _pecaService.AtualizarPecaAsync(item.PecaEAN, peca);

                    await VerificarEReporStockAsync(peca);
                }
            }
        }

        // Notificação por email (RF faturação) — best-effort, não bloqueia
        _ = Task.Run(async () =>
        {
            try
            {
                var cliente = await _clienteService.ObterPorNifAsync(faturaDto.ClienteNIF);
                if (cliente is null || string.IsNullOrWhiteSpace(cliente.Email)) return;

                var descricao = faturaDto.ServicoID.HasValue
                    ? $"Serviço de reparação #{faturaDto.ServicoID}"
                    : (faturaDto.VendaID.HasValue ? $"Venda #{faturaDto.VendaID}" : "Transação");

                await _emailService.EnviarFaturaAsync(
                    cliente.Email,
                    string.IsNullOrWhiteSpace(cliente.Nome) ? "Cliente" : cliente.Nome,
                    faturaDto.NumeroFatura,
                    faturaDto.ValorTotal,
                    faturaDto.MetodoPagamento,
                    descricao);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FaturaService] Falha ao enviar email da fatura {faturaDto.NumeroFatura}: {ex.Message}");
            }
        });

        return faturaCriada;
    }

    // Após cada abate de stock, se ficar <= stockMinimo e não existir já uma
    // encomenda em curso para aquela peça, cria automaticamente uma nova
    // EncomendaStock com Quantidade = PadraoReposicao (estado PENDENTE).
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
            // Reposição é best-effort — não deve falhar a venda se falhar.
            Console.WriteLine($"[AutoReposicao] Erro ao processar {peca.CodigoEAN}: {ex.Message}");
        }
    }

    public async Task<bool> EliminarFaturaAsync(string numero)
    {
        var response = await _httpClient.DeleteAsync($"api/faturas/{numero}");
        return response.IsSuccessStatusCode;
    }

    public async Task<FaturaDto?> ProcessarDevolucaoAsync(string numeroFatura, string motivo)
    {
        if (string.IsNullOrWhiteSpace(numeroFatura))
            throw new ArgumentException("Número de fatura obrigatório.", nameof(numeroFatura));
        if (string.IsNullOrWhiteSpace(motivo))
            throw new ArgumentException("Motivo da devolução obrigatório.", nameof(motivo));

        var fatura = await GetFaturaPorNumeroAsync(numeroFatura);
        if (fatura is null)
            throw new InvalidOperationException("Fatura não encontrada.");

        if (fatura.Devolucoes.Any())
            throw new InvalidOperationException("Esta fatura já foi devolvida.");

        // Reverter stock (apenas vendas têm itens de peças; serviços não reabastecem stock)
        if (fatura.VendaID.HasValue)
        {
            var venda = await _vendaService.ObterVendaAsync(fatura.VendaID.Value);
            if (venda is not null)
            {
                foreach (var item in venda.ItensVenda)
                {
                    var peca = await _pecaService.GetPecaPorEanAsync(item.PecaEAN);
                    if (peca is null) continue;
                    peca.StockAtual += item.Quantidade;
                    await _pecaService.AtualizarPecaAsync(item.PecaEAN, peca);
                }
            }
        }

        var payload = new
        {
            Devolucoes = new[]
            {
                new
                {
                    Motivo = motivo,
                    NotaCredito = new { ValorCreditado = fatura.ValorTotal }
                }
            }
        };

        var response = await _httpClient.PutAsJsonAsync(
            $"api/faturas/{Uri.EscapeDataString(numeroFatura)}", payload, _options);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"Mongoose recusou a devolução: {(int)response.StatusCode}.");

        return await response.Content.ReadFromJsonAsync<FaturaDto>(_options);
    }
}
