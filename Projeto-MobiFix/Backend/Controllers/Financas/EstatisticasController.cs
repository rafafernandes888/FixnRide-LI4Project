namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ApenasAdmin")]
public class EstatisticasController : ControllerBase
{
    private readonly IEstatisticasService _service;

    public EstatisticasController(IEstatisticasService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<EstatisticaDto>> Get()
    {
        var stats = await _service.GetEstatisticasAsync();
        return Ok(stats);
    }

    [HttpGet("dia")]
    public async Task<ActionResult<EstatisticaDto>> GetDia([FromQuery] DateTime dia)
    {
        var stats = await _service.GetEstatisticaDiaAsync(dia);
        return Ok(stats);
    }

    [HttpGet("intervalo")]
    public async Task<ActionResult<EstatisticaDto>> GetIntervalo(
        [FromQuery] DateTime inicio,
        [FromQuery] DateTime fim)
    {
        if (fim < inicio) return BadRequest("A data de fim deve ser posterior à de início.");
        var stats = await _service.GetIntervaloEstatisticaAsync(inicio, fim);
        return Ok(stats);
    }
}
