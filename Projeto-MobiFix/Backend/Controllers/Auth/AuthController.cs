namespace Backend.Controllers;

using System.IdentityModel.Tokens.Jwt;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    public const string AuthCookieName = "mobifix_auth";

    private readonly IAuthService _authService;
    private readonly ITokenListService _tokenList;

    public AuthController(IAuthService authService, ITokenListService tokenList)
    {
        _authService = authService;
        _tokenList = tokenList;
    }

    [HttpPost("login/funcionario")]
    public async Task<IActionResult> LoginFuncionario([FromBody] FuncionarioLoginDto loginDto)
    {
        var token = await _authService.LoginFuncionarioAsync(loginDto);

        if (token is null)  return Unauthorized(new { mensagem = "Número mecanográfico ou password incorretos." });

        EmitirCookieEWhitelist(token);
        return Ok(new { token });
    }

    [HttpPost("register/cliente")]
    public async Task<IActionResult> Registar([FromBody] ClienteRegistoDto registoDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var sucesso = await _authService.RegistarClienteAsync(registoDto);

        if (!sucesso)
            return Conflict(new { mensagem = "Não foi possível criar a conta. O NIF já deve estar registado." });

        return Created(string.Empty, new { mensagem = "Conta criada com sucesso." });
    }

    [HttpPost("login/cliente")]
    public async Task<IActionResult> Login([FromBody] ClienteLoginDto loginDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(loginDto.NIF))
            return BadRequest(new { mensagem = "É necessário fornecer o NIF." });

        var token = await _authService.LoginClienteAsync(loginDto);

        if (token is null)
            return Unauthorized(new { mensagem = "Credenciais inválidas." });

        EmitirCookieEWhitelist(token);
        return Ok(new { token });
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (!string.IsNullOrEmpty(jti))
            _tokenList.Revoke(jti);

        Response.Cookies.Delete(AuthCookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        return NoContent();
    }

    private void EmitirCookieEWhitelist(string token)
    {
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        var jti = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;
        var expiresAt = jwt.ValidTo == DateTime.MinValue
            ? DateTimeOffset.UtcNow.AddHours(8)
            : new DateTimeOffset(jwt.ValidTo, TimeSpan.Zero);

        if (!string.IsNullOrEmpty(jti))
            _tokenList.Whitelist(jti, expiresAt);

        Response.Cookies.Append(AuthCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = expiresAt
        });
    }
}
