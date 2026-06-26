namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class FaturaDto
{
    public string NumeroFatura { get; set; } = string.Empty;
    public string ClienteNIF { get; set; } = string.Empty;
    public int? ServicoID { get; set; }
    public int? VendaID { get; set; }
    public decimal ValorTotal { get; set; }
    public string MetodoPagamento { get; set; } = string.Empty;
    public string? DataEmissao { get; set; }
    public List<DevolucaoDto> Devolucoes { get; set; } = new();
}




public class DevolucaoDto
{
    public string? DevolucaoID { get; set; }
    public string? DataDevolucao { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public NotaCreditoDto? NotaCredito { get; set; }
}

public class DevolucaoCriacaoDto
{
    [Required]
    [MinLength(3, ErrorMessage = "O motivo deve ter pelo menos 3 caracteres.")]
    public string Motivo { get; set; } = string.Empty;
}

public class NotaCreditoDto
{
    public decimal ValorCreditado { get; set; }
}

public class FaturaCriacaoDto
{
    [Required]
    public string NumeroFatura { get; set; } = string.Empty;
    [Required]
    public string ClienteNIF { get; set; } = string.Empty;
    public int? ServicoID { get; set; }
    public int? VendaID { get; set; }
    
    [Range(0.01, double.MaxValue)]
    public decimal ValorTotal { get; set; }
    [Required]
    public string MetodoPagamento { get; set; } = string.Empty;

    // NOVO: Receber os itens para podermos abater no stock
    public List<ItemVendaCriacaoDto> ItensVenda { get; set; } = new();
}