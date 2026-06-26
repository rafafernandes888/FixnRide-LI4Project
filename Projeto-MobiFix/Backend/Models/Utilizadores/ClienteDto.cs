namespace Backend.Models;

public class ClienteDto
{
    public string NIF { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Morada { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}