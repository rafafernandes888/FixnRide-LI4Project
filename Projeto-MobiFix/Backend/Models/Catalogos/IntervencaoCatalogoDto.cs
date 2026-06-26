namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class IntervencaoCatalogoDto
{
    public int IntervencaoID { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal PrecoFixoMaoDeObra { get; set; }
    public string? Especialidade { get; set; }
}

public class IntervencaoCatalogoCriacaoDto
{
    [Required(ErrorMessage = "A descrição é obrigatória.")]
    public string Descricao { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "O preço deve ser positivo.")]
    public decimal PrecoFixoMaoDeObra { get; set; }

    public string? Especialidade { get; set; }
}