namespace Backend.Services;

using System.Net.Http.Json;
using System.Text.Json;
using Backend.Models;

public class FuncionarioService : IFuncionarioService
{
    private readonly HttpClient _httpClient;

    private static readonly JsonSerializerOptions _optionsPascalCase = new JsonSerializerOptions
    {
        PropertyNamingPolicy = null
    };

    public FuncionarioService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<FuncionarioDto?> CriarFuncionarioAsync(FuncionarioCriacaoDto criacaoDto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(criacaoDto.PasswordHash);

        var payload = new
        {
            criacaoDto.NumeroMecanografico,
            criacaoDto.Nome,
            criacaoDto.Email,
            criacaoDto.Contacto,
            criacaoDto.Cargo,
            PasswordHash = passwordHash,
            criacaoDto.Especialidade,
            criacaoDto.Ativo
        };

        var response = await _httpClient.PostAsJsonAsync("api/funcionarios", payload, _optionsPascalCase);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<FuncionarioDto>(_optionsPascalCase);
    }

    public async Task<IEnumerable<FuncionarioDto>> ListarFuncionariosAsync()
    {
        var funcionarios = await _httpClient.GetFromJsonAsync<IEnumerable<FuncionarioDto>>(
            "api/funcionarios",
            _optionsPascalCase
        );

        return funcionarios ?? Enumerable.Empty<FuncionarioDto>();
    }

    public async Task<FuncionarioDto?> ObterFuncionarioPorNumeroAsync(string numeroMecanografico)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<FuncionarioDto>(
                $"api/funcionarios/{numeroMecanografico}",
                _optionsPascalCase
            );
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

    public async Task<FuncionarioDto?> AtualizarFuncionarioAsync(string numeroMecanografico, FuncionarioAtualizacaoDto atualizacaoDto)
    {
        var response = await _httpClient.PutAsJsonAsync(
            $"api/funcionarios/{numeroMecanografico}",
            atualizacaoDto,
            _optionsPascalCase
        );

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<FuncionarioDto>(_optionsPascalCase);
    }
}