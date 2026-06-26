namespace Backend.Models;

public class EstatisticaDto
{
    public double TempoMedioServicoMinutos { get; set; }
    public decimal FaturacaoTotal { get; set; }
    public decimal FaturacaoServicos { get; set; }
    public decimal FaturacaoVendas { get; set; }
    public List<Faturacao> Movimentacao { get; set; } = new();
    public int NumeroAgendamentos { get; set; }
    public int NumeroVendas { get; set; }
    public int ServicosRealizados { get; set; }
    public List<DevolucaoDto> Devolucoes { get; set; } = new();
    public decimal ValorTotalDevolucoes { get; set; }
}

public class Faturacao
{
    public string Categoria { get; set; } = string.Empty; // "SERVICO" ou "VENDA"
    public FaturaDto Fatura { get; set; } = null!;
    public decimal Valor { get; set; }
}
