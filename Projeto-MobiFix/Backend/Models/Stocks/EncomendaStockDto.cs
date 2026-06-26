namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class EncomendaStockDto
{
    public int EncomendaID { get; set; }
    public string PecaEAN { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string DataPedido { get; set; } = string.Empty;
    public string? OperadorRececaoNumero { get; set; }
    public string? AdminValidadorNumero { get; set; }
}

public class EncomendaStockCriacaoDto
{
    [Required]
    public string PecaEAN { get; set; } = string.Empty;
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantidade { get; set; }
    public string? AdminValidadorNumero { get; set; }
}

public class EncomendaStockAtualizacaoDto
{
    [Required]
    public string Estado { get; set; } = string.Empty;
    public string? OperadorRececaoNumero { get; set; }
}
