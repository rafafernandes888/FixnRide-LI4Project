namespace Backend.Models;
using System.ComponentModel.DataAnnotations;

public class FuncionarioDto
{
    public string NumeroMecanografico {get; set;} = string.Empty;
    public string Nome {get; set;} = string.Empty;
    public string Email {get; set;} = string.Empty;
    public string Contacto {get; set;} = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string PasswordHash {get;set;} = string.Empty;
    public string? Especialidade {get;set;} = string.Empty;
    public bool Ativo {get;set;}
}

public class FuncionarioCriacaoDto
{
    [Required(ErrorMessage = "O número mecanográfico é obrigatório.")]
    public string NumeroMecanografico { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    public string Email { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O contacto é obrigatório.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "O contacto deve ter exatamente 9 dígitos.")]
    public string Contacto { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O cargo é obrigatório.")]
    public string Cargo { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "A password é obrigatória.")]
    [MinLength(8, ErrorMessage = "A password deve ter pelo menos 8 caracteres.")]
    public string PasswordHash { get; set; } = string.Empty;
 
    public string? Especialidade { get; set; }
 
    public bool Ativo { get; set; } = true;
}
 
public class FuncionarioAtualizacaoDto
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    public string Nome { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    public string Email { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O contacto é obrigatório.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "O contacto deve ter exatamente 9 dígitos.")]
    public string Contacto { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "O cargo é obrigatório.")]
    public string Cargo { get; set; } = string.Empty;
 
    public string? Especialidade { get; set; }
 
    public bool Ativo { get; set; }
}