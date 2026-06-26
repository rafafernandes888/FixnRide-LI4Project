namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class EstatisticasService : IEstatisticasService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions _options = new() { PropertyNamingPolicy = null };

    public EstatisticasService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public Task<EstatisticaDto> GetEstatisticaDiaAsync(DateTime dia)
    {
        DateTime inicio = dia.Date;
        DateTime fim = dia.Date.AddDays(1).AddTicks(-1);
        return ComporEstatisticaAsync(inicio, fim);
    }

    public Task<EstatisticaDto> GetIntervaloEstatisticaAsync(DateTime inicio, DateTime fim)
    {
        return ComporEstatisticaAsync(inicio, fim);
    }

    public Task<EstatisticaDto> GetEstatisticasAsync()
    {
        return ComporEstatisticaAsync(null, null);
    }

    private async Task<EstatisticaDto> ComporEstatisticaAsync(DateTime? inicio, DateTime? fim)
    {
        string range = "";
        if (inicio.HasValue) range += $"dataMin={inicio.Value:yyyy-MM-ddTHH:mm:ss.fffZ}";
        if (fim.HasValue)
        {
            if (range.Length > 0) range += "&";
            range += $"dataMax={fim.Value:yyyy-MM-ddTHH:mm:ss.fffZ}";
        }
        string query = range.Length > 0 ? "?" + range : "";

        try
        {
            Task<List<FaturaDto>?> faturasTask =
                _httpClient.GetFromJsonAsync<List<FaturaDto>>($"api/faturas{query}", _options);

            Task<List<ServicoDto>?> servicosTask =
                _httpClient.GetFromJsonAsync<List<ServicoDto>>($"api/servicos{query}", _options);

            Task<List<AgendaDto>?> agendaTask =
                _httpClient.GetFromJsonAsync<List<AgendaDto>>("api/agenda", _options);

            await Task.WhenAll(faturasTask, servicosTask, agendaTask);

            var faturas = faturasTask.Result ?? new List<FaturaDto>();
            var servicos = servicosTask.Result ?? new List<ServicoDto>();
            var agenda = agendaTask.Result ?? new List<AgendaDto>();

            // Agenda filtrada pelo intervalo (usamos DataHoraInicio)
            if (inicio.HasValue) agenda = agenda.Where(a => a.DataHoraInicio >= inicio.Value).ToList();
            if (fim.HasValue) agenda = agenda.Where(a => a.DataHoraInicio <= fim.Value).ToList();

            // Movimentação: cada fatura é classificada como SERVICO ou VENDA
            var movimentacao = faturas.Select(f => new Faturacao
            {
                Categoria = f.ServicoID.HasValue ? "SERVICO" : "VENDA",
                Fatura = f,
                Valor = f.ValorTotal
            }).ToList();

            decimal faturacaoServicos = movimentacao
                .Where(m => m.Categoria == "SERVICO").Sum(m => m.Valor);
            decimal faturacaoVendas = movimentacao
                .Where(m => m.Categoria == "VENDA").Sum(m => m.Valor);

            // Tempo médio de serviço em minutos.
            // Prioridade: dataConclusao - dataAgendamento nos serviços concluídos.
            // Fallback: soma dos tempoGastoMinutos das intervenções.
            var temposServicos = new List<double>();
            foreach (var s in servicos)
            {
                if (s.DataConclusao.HasValue)
                {
                    double minutos = (s.DataConclusao.Value - s.DataAgendamento).TotalMinutes;
                    if (minutos > 0) temposServicos.Add(minutos);
                    continue;
                }

                var somaIntervencoes = s.HistoricoIntervencoes
                    .Where(i => i.TempoGastoMinutos.HasValue)
                    .Sum(i => i.TempoGastoMinutos!.Value);
                if (somaIntervencoes > 0) temposServicos.Add(somaIntervencoes);
            }

            double tempoMedio = temposServicos.Count > 0
                ? temposServicos.Average()
                : 0;

            // Devoluções: achatar de todas as faturas
            var devolucoes = faturas.SelectMany(f => f.Devolucoes).ToList();
            decimal valorDevolucoes = devolucoes
                .Where(d => d.NotaCredito != null)
                .Sum(d => d.NotaCredito!.ValorCreditado);

            int servicosRealizados = servicos.Count(s =>
                s.Estado.Equals("CONCLUIDO", StringComparison.OrdinalIgnoreCase) ||
                s.Estado.Equals("FINALIZADO", StringComparison.OrdinalIgnoreCase));

            return new EstatisticaDto
            {
                TempoMedioServicoMinutos = tempoMedio,
                FaturacaoTotal = faturacaoServicos + faturacaoVendas,
                FaturacaoServicos = faturacaoServicos,
                FaturacaoVendas = faturacaoVendas,
                Movimentacao = movimentacao,
                NumeroAgendamentos = agenda.Count,
                NumeroVendas = movimentacao.Count(m => m.Categoria == "VENDA"),
                ServicosRealizados = servicosRealizados,
                Devolucoes = devolucoes,
                ValorTotalDevolucoes = valorDevolucoes
            };
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"Erro ao contactar a API de dados: {ex.Message}");
            throw;
        }
    }
}
