namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrotinetesController : ControllerBase
{
    private readonly ITrotineteService _trotineteService;

    public TrotinetesController(ITrotineteService trotineteService)
    {
        _trotineteService = trotineteService;
    }

    // GET api/trotinetes  — devolve só as trotinetes do cliente autenticado
    [HttpGet]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> GetMinhasTrotinetes()
    {
        var clienteNIF = User.FindFirst("id")?.Value;

        if (clienteNIF is null)
            return Unauthorized(new { mensagem = "Token inválido." });

        var trotinetes = await _trotineteService.GetTrotinetesClienteAsync(clienteNIF);
        return Ok(trotinetes);
    }

    // GET por número de série — acessível a Staff (mecânico no diagnóstico) e Admin
    [HttpGet("{numeroSerie}")]
    [Authorize(Policy = "TodosAutenticados")]
    public async Task<IActionResult> GetTrotineteByNumero(string numeroSerie)
    {
        var trotinete = await _trotineteService.GetTrotineteNumeroSerie(numeroSerie);
        return Ok(trotinete);
    }

    // POST api/trotinetes  — regista uma nova trotinete para o cliente autenticado
    [HttpPost]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> CriarTrotinete([FromBody] TrotinetelCriacaoDto criacaoDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var clienteNIF = User.FindFirst("id")?.Value;

        if (clienteNIF is null)
            return Unauthorized(new { mensagem = "Token inválido." });

        var trotinete = await _trotineteService.CriarTrotineteAsync(clienteNIF, criacaoDto);

        if (trotinete is null)
            return Conflict(new { mensagem = "Não foi possível registar a trotinete. O número de série já deve estar registado." });

        return Created(string.Empty, trotinete);
    }

    // DELETE api/trotinetes/{numeroSerie}  — remove uma trotinete do cliente autenticado
    [HttpDelete("{numeroSerie}")]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> EliminarTrotinete(string numeroSerie)
    {
        var clienteNIF = User.FindFirst("id")?.Value;

        if (clienteNIF is null)
            return Unauthorized(new { mensagem = "Token inválido." });

        var sucesso = await _trotineteService.EliminarTrotineteAsync(clienteNIF, numeroSerie);

        if (!sucesso)
            return NotFound(new { mensagem = "Trotinete não encontrada ou não pertence a esta conta." });

        return NoContent();
    }
}