namespace Backend.Services;
using Backend.Models;

public interface IAuthService
{
    Task<string?> LoginFuncionarioAsync(FuncionarioLoginDto loginFuncionarioDto);
    Task<string?> LoginClienteAsync(ClienteLoginDto loginClienteDto);
    Task<bool> RegistarClienteAsync(ClienteRegistoDto registoClienteDto);
}