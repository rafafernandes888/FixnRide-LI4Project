namespace Backend.Models;

public class PecaDto
{
    public string CodigoEAN { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public int StockAtual { get; set; } 
    public float PVP { get; set; } 
    public float CustoAquisicao { get; set; }
    public int StockMinimo { get; set; } 
    public int PadraoReposicao { get; set; }
    public string Imagem { get; set; } = string.Empty;
    public bool Ativo { get; set; }
}

public class EstadoPecaDto
{
    public bool Ativo { get; set; }
}