namespace Backend.Models;
 
using System.ComponentModel.DataAnnotations;
 
public class ClienteLoginDto
{
    [Required(ErrorMessage = "O NIF é obrigatório")]
    public string NIF { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "A password é obrigatória.")]
    public string Password { get; set; } = string.Empty;
}
 