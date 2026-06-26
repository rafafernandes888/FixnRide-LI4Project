namespace Backend.Services;

using System.Text.Json; 
using System.Text.Json.Serialization;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

public class AuthService: IAuthService 
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    private static readonly JsonSerializerOptions _optionsPascalCase = new JsonSerializerOptions
    {
        PropertyNamingPolicy = null // Isto impede a conversão para minúsculas
    };

    public AuthService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string?> LoginFuncionarioAsync(FuncionarioLoginDto loginDto)
    {
        var url = $"api/auth/funcionario/{loginDto.NumeroMecanografico}";
        var funcionario = await _httpClient.GetFromJsonAsync<FuncionarioDto>(url);

        if (funcionario is null) return null;

        bool passwordValida = BCrypt.Net.BCrypt.Verify(loginDto.Password, funcionario.PasswordHash);
        if (!passwordValida) return null;

        return GerarTokenFuncionario(funcionario);
    }

    public async Task<string?> LoginClienteAsync(ClienteLoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.NIF))
            return null;
 
        var cliente = await _httpClient.GetFromJsonAsync<ClienteDto>($"api/auth/cliente/{loginDto.NIF}");
 
        if (cliente is null)
            return null;
 
        bool passwordValida = BCrypt.Net.BCrypt.Verify(loginDto.Password, cliente.PasswordHash);
        if (!passwordValida)
            return null;
 
        return GerarTokenCliente(cliente);
    } 

    public async Task<bool> RegistarClienteAsync(ClienteRegistoDto registoDto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registoDto.Password);
 
        var payload = new
        {
            registoDto.NIF,
            registoDto.Nome,
            registoDto.Telefone,
            registoDto.Morada,
            registoDto.Email,
            PasswordHash = passwordHash
        };
 
        var response = await _httpClient.PostAsJsonAsync("api/clientes", payload, _optionsPascalCase);
        return response.IsSuccessStatusCode;
    }


    private string GerarTokenFuncionario(FuncionarioDto funcionario)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey não está configurado.");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("id", funcionario.NumeroMecanografico),
            new Claim("nome", funcionario.Nome),
            new Claim("cargo", funcionario.Cargo)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GerarTokenCliente(ClienteDto cliente)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JwtSettings:SecretKey não está configurado.");
 
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("id", cliente.NIF),
            new Claim("nome", cliente.Nome),
            new Claim("email", cliente.Email),
            new Claim("cargo", "Cliente")
        };
 
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
 
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );
 
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}