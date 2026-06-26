namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class PromocaoDto
{
    public int PromocaoID { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int PercentagemDesconto { get; set; }
    public string DataInicio { get; set; } = string.Empty;
    public string DataFim { get; set; } = string.Empty;
    public string AdministradorNumero { get; set; } = string.Empty;
    public bool Ativa { get; set; }
    public List<string> PecasAplicaveisEANs { get; set; } = new();
}

public class PromocaoCriacaoDto
{
    [Required]
    public int PromocaoID { get; set; }
    [Required]
    public string Descricao { get; set; } = string.Empty;
    [Required]
    public int PercentagemDesconto { get; set; }
    [Required]
    public string DataInicio { get; set; } = string.Empty;
    [Required]
    public string DataFim { get; set; } = string.Empty;
    public string AdministradorNumero { get; set; } = "ADM001";
    public List<string> PecasAplicaveisEANs { get; set; } = new();
}
