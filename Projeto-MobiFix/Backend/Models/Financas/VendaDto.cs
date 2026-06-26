namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class VendaDto
{
    public int VendaID { get; set; }
    public string OperadorNumero { get; set; } = string.Empty;
    public string? DataVenda { get; set; }
    public decimal Total { get; set; }
    public List<ItemVendaDto> ItensVenda { get; set; } = new();
}

public class ItemVendaDto
{
    public string PecaEAN { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}


public class CheckoutVendaDiretaDto
{
    [Required]
    public string NumeroFatura { get; set; } = string.Empty;
    public string ClienteNIF { get; set; } = string.Empty;

    // Ignorado pelo backend — o operador é derivado do JWT. Mantém-se aqui apenas
    // para compatibilidade com payloads existentes do frontend.
    public string? OperadorNumero { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal ValorTotal { get; set; }

    [Required]
    public string MetodoPagamento { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "A venda deve ter pelo menos uma peça.")]
    public List<ItemVendaCriacaoDto> ItensVenda { get; set; } = new();
}

public class ItemVendaCriacaoDto
{
    [Required]
    public string PecaEAN { get; set; } = string.Empty;

    [Range(1, 99, ErrorMessage = "A quantidade deve ser entre 1 e 99.")]
    public int Quantidade { get; set; }

    [Range(typeof(decimal), "0", "999999.99", ErrorMessage = "O preço não pode ser negativo.")]
    public decimal PrecoUnitario { get; set; }
}

public class VendaComFaturaDto
{
    public VendaDto Venda { get; set; } = null!;
    public FaturaDto Fatura { get; set; } = null!;
}
