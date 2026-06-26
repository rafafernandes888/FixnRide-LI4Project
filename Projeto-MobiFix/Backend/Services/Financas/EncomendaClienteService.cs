namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class EncomendaClienteService : IEncomendaClienteService
{
    private readonly HttpClient _httpClient;
    private readonly IFaturaService _faturaService;
    private readonly IPecaService _pecaService;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public EncomendaClienteService(HttpClient httpClient, IFaturaService faturaService, IPecaService pecaService)
    {
        _httpClient = httpClient;
        _faturaService = faturaService;
        _pecaService = pecaService;
    }

    public async Task<EncomendaClienteDto?> CriarEncomendaAsync(string clienteNIF, EncomendaClienteCriacaoDto dto)
    {
        if (dto.Itens is null || !dto.Itens.Any())
            throw new ArgumentException("Reserva sem itens.");

        // Agrupar itens repetidos (mesmo EAN) para validar o total pedido
        var pedidoPorEan = dto.Itens
            .GroupBy(i => i.PecaEAN, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantidade), StringComparer.OrdinalIgnoreCase);

        // Quantidades já reservadas noutras encomendas PRONTO PARA LEVANTAMENTO
        var pendentes = await _httpClient.GetFromJsonAsync<IEnumerable<EncomendaClienteDto>>(
            "api/encomendas-cliente?estado=PRONTO PARA LEVANTAMENTO", _options)
            ?? Enumerable.Empty<EncomendaClienteDto>();

        var reservadoPorEan = pendentes
            .SelectMany(e => e.Itens)
            .GroupBy(i => i.PecaEAN, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantidade), StringComparer.OrdinalIgnoreCase);

        foreach (var (ean, pedido) in pedidoPorEan)
        {
            var peca = await _pecaService.GetPecaPorEanAsync(ean);
            if (peca is null)
                throw new InvalidOperationException($"Peça {ean} não existe.");

            reservadoPorEan.TryGetValue(ean, out var jaReservado);
            var disponivel = peca.StockAtual - jaReservado;

            if (pedido > disponivel)
                throw new InvalidOperationException(
                    $"Stock insuficiente para '{peca.Nome}' (EAN {ean}): pedido {pedido}, disponível {Math.Max(0, disponivel)}.");
        }

        // Total calculado aqui — não vem do frontend, evita manipulação de preços
        var total = dto.Itens.Sum(i => i.PrecoUnitario * i.Quantidade);

        var payload = new
        {
            EncomendaClienteID = Random.Shared.Next(10, int.MaxValue),
            ClienteNIF         = clienteNIF,
            Total              = total,
            Estado             = "PRONTO PARA LEVANTAMENTO",
            FaturaId           = (int?)null,   // só preenchido no pagamento
            Itens              = dto.Itens.Select(i => new
            {
                PecaEAN    = i.PecaEAN,
                Quantidade = i.Quantidade
            })
        };

        var response = await _httpClient.PostAsJsonAsync("api/encomendas-cliente", payload, _options);

        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<EncomendaClienteDto>(_options);
    }

    public async Task<IEnumerable<EncomendaClienteDto>> ListarEncomendasClienteAsync(string clienteNIF)
    {
        var todas = await _httpClient.GetFromJsonAsync<IEnumerable<EncomendaClienteDto>>(
            $"api/encomendas-cliente?clienteId={clienteNIF}", _options
        ) ?? Enumerable.Empty<EncomendaClienteDto>();

        return todas;
    }

    public async Task<IEnumerable<PecaReservadaDto>> ListarProntasParaLevantamentoAsync()
    {
        // Mongoose normaliza estado para UPPERCASE — "PRONTO PARA LEVANTAMENTO" é o default
        var encomendasTask = _httpClient.GetFromJsonAsync<IEnumerable<EncomendaClienteDto>>(
            "api/encomendas-cliente?estado=PRONTO PARA LEVANTAMENTO", _options);
        var pecasTask = _httpClient.GetFromJsonAsync<IEnumerable<PecaDto>>(
            "api/pecas", _options);

        await Task.WhenAll(encomendasTask, pecasTask);

        var encomendas = encomendasTask.Result ?? Enumerable.Empty<EncomendaClienteDto>();
        var pecas = (pecasTask.Result ?? Enumerable.Empty<PecaDto>())
            .ToDictionary(p => p.CodigoEAN, p => p);

        return encomendas.Select(e => new PecaReservadaDto
        {
            EncomendaClienteID = e.EncomendaClienteID,
            ClienteNIF         = e.ClienteNIF,
            DataEncomenda      = e.DataEncomenda,
            Estado             = e.Estado,
            Total              = e.Total,
            Itens              = e.Itens.Select(i =>
            {
                pecas.TryGetValue(i.PecaEAN, out var peca);
                return new ItemEncomendaDetalhadoDto
                {
                    PecaEAN       = i.PecaEAN,
                    Nome          = peca?.Nome,
                    Categoria     = peca?.Categoria,
                    Quantidade    = i.Quantidade,
                    PrecoUnitario = peca is null ? null : peca.PVP
                };
            }).ToList()
        });
    }

    public async Task<bool> MarcarComoLevantadaAsync(int id)
    {
        var payload = new { Estado = "LEVANTADA" };
        var response = await _httpClient.PutAsJsonAsync($"api/encomendas-cliente/{id}", payload, _options);
        return response.IsSuccessStatusCode;
    }

    public async Task<FaturaDto?> LevantarComFaturaAsync(int id, string metodoPagamento)
    {
        if (string.IsNullOrWhiteSpace(metodoPagamento))
            throw new ArgumentException("Método de pagamento obrigatório.", nameof(metodoPagamento));

        var encomenda = await _httpClient.GetFromJsonAsync<EncomendaClienteDto>(
            $"api/encomendas-cliente/{id}", _options)
            ?? throw new InvalidOperationException($"Encomenda {id} não encontrada.");

        if (!string.Equals(encomenda.Estado, "PRONTO PARA LEVANTAMENTO", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Encomenda não está pronta para levantamento.");

        var numeroFatura = $"ENC-{id}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var faturaDto = new FaturaCriacaoDto
        {
            NumeroFatura = numeroFatura,
            ClienteNIF = encomenda.ClienteNIF,
            ValorTotal = encomenda.Total,
            MetodoPagamento = metodoPagamento,
            ItensVenda = encomenda.Itens.Select(i => new ItemVendaCriacaoDto
            {
                PecaEAN = i.PecaEAN,
                Quantidade = i.Quantidade
            }).ToList()
        };

        var fatura = await _faturaService.CriarFaturaAsync(faturaDto)
            ?? throw new InvalidOperationException("Falha ao emitir fatura.");

        var update = new { Estado = "LEVANTADA", FaturaNumero = numeroFatura };
        var response = await _httpClient.PutAsJsonAsync(
            $"api/encomendas-cliente/{id}", update, _options);

        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException("Fatura emitida mas falha a atualizar estado da encomenda.");

        return fatura;
    }
}