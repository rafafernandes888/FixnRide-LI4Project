namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EncomendaClienteController : ControllerBase
{
    private readonly IEncomendaClienteService _encomendaService;

    public EncomendaClienteController(IEncomendaClienteService encomendaService)
    {
        _encomendaService = encomendaService;
    }

    // GET api/EncomendaCliente  — lista só as encomendas do cliente autenticado
    [HttpGet]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> ListarMinhasEncomendas()
    {
        var clienteNIF = User.FindFirst("id")?.Value;
        if (clienteNIF is null) return Unauthorized(new { mensagem = "Token inválido." });

        var encomendas = await _encomendaService.ListarEncomendasClienteAsync(clienteNIF);
        return Ok(encomendas);
    }

    // POST api/EncomendaCliente  — cria uma reserva para o cliente autenticado
    [HttpPost]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> CriarEncomenda([FromBody] EncomendaClienteCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var clienteNIF = User.FindFirst("id")?.Value;
        if (clienteNIF is null) return Unauthorized(new { mensagem = "Token inválido." });

        try
        {
            var encomenda = await _encomendaService.CriarEncomendaAsync(clienteNIF, dto);

            if (encomenda is null)
                return BadRequest(new { mensagem = "Não foi possível criar a reserva." });

            return Created(string.Empty, encomenda);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    // GET api/EncomendaCliente/prontas — lista as encomendas prontas para levantamento
    [HttpGet("prontas")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> ListarProntas()
    {
        var encomendasProntas = await _encomendaService.ListarProntasParaLevantamentoAsync();
        return Ok(encomendasProntas);
    }

    // PUT api/EncomendaCliente/{id}/levantar — emite fatura, abate stock e marca como levantada
    [HttpPut("{id}/levantar")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> LevantarEncomenda(int id, [FromBody] LevantamentoEncomendaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var fatura = await _encomendaService.LevantarComFaturaAsync(id, dto.MetodoPagamento);
            return Ok(new { mensagem = "Encomenda levantada e faturada.", fatura });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}