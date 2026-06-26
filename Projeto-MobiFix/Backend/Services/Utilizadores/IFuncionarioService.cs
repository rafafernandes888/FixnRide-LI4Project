namespace Backend.Services;

using Backend.Models;

public interface IFuncionarioService
{
    Task<FuncionarioDto?> CriarFuncionarioAsync(FuncionarioCriacaoDto criacaoDto);
    Task<IEnumerable<FuncionarioDto>> ListarFuncionariosAsync();
    Task<FuncionarioDto?> ObterFuncionarioPorNumeroAsync(string numeroMecanografico);
    Task<FuncionarioDto?> AtualizarFuncionarioAsync(string numeroMecanografico, FuncionarioAtualizacaoDto atualizacaoDto);
}