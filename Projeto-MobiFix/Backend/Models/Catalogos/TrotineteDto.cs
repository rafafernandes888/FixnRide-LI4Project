namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class TrotineteDto
{
    public string NumeroSerie { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string ClienteNIF { get; set; } = string.Empty;
    public bool EmServico { get; set; }
}

public class TrotinetelCriacaoDto
{
    [Required(ErrorMessage = "O número de série é obrigatório.")]
    public string NumeroSerie { get; set; } = string.Empty;

    [Required(ErrorMessage = "A marca é obrigatória.")]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "O modelo é obrigatório.")]
    public string Modelo { get; set; } = string.Empty;
}