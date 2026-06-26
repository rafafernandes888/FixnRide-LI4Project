namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class ClienteRegistoDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "A morada é obrigatória.")]
    public string Morada { get; set; } = string.Empty;

    [Required(ErrorMessage = "O NIF é obrigatório.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "O NIF deve ter exatamente 9 dígitos.")]
    public string NIF { get; set; } = string.Empty;

    [Required(ErrorMessage = "O telefone é obrigatório.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "O telefone deve ter exatamente 9 dígitos.")]
    public string Telefone { get; set; } = string.Empty;

    [Required(ErrorMessage = "A password é obrigatória.")]
    public string Password { get; set; } = string.Empty;
}