namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class EncomendaClienteDto
{
    public int EncomendaClienteID { get; set; }
    public string ClienteNIF { get; set; } = string.Empty;
    public string DataEncomenda { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public int? FaturaNumero { get; set; }
    public List<ItemEncomendaDto> Itens { get; set; } = new();
}

public class ItemEncomendaDto
{
    public string PecaEAN { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}

// Só os campos que o cliente envia — NIF vem do token, total calculado no backend
public class EncomendaClienteCriacaoDto
{
    [Required(ErrorMessage = "A encomenda deve ter pelo menos uma peça.")]
    [MinLength(1, ErrorMessage = "A encomenda deve ter pelo menos uma peça.")]
    public List<ItemEncomendaCriacaoDto> Itens { get; set; } = new();
}

public class ItemEncomendaCriacaoDto
{
    [Required]
    public string PecaEAN { get; set; } = string.Empty;

    [Range(1, 99, ErrorMessage = "A quantidade deve ser entre 1 e 99.")]
    public int Quantidade { get; set; }

    // Preço unitário enviado pelo frontend para o backend calcular o total
    // (o backend podia ir buscar à Data API mas evitamos um GET extra por peça)
    [Range(typeof(decimal), "0.01", "999999.99", ErrorMessage = "O preço deve ser positivo.")]
    public decimal PrecoUnitario { get; set; }
}

public class PecaReservadaDto
{
    public int EncomendaClienteID { get; set; }
    public string ClienteNIF { get; set; } = string.Empty;
    public string DataEncomenda { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public List<ItemEncomendaDetalhadoDto> Itens { get; set; } = new();
}

public class ItemEncomendaDetalhadoDto
{
    public string PecaEAN { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public string? Categoria { get; set; }
    public int Quantidade { get; set; }
    public double? PrecoUnitario { get; set; }
}

public class LevantamentoEncomendaDto
{
    [Required]
    public string MetodoPagamento { get; set; } = string.Empty;
}