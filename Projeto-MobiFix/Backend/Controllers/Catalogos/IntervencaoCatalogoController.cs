namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IntervencoesCatalogoController : ControllerBase
{
    private readonly IIntervencaoCatalogoService _service;

    public IntervencoesCatalogoController(IIntervencaoCatalogoService service)
    {
        _service = service;
    }

    // GET api/IntervencoesCatalogo?especialidade=BATERIAS
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? especialidade)
    {
        var lista = await _service.ListarTodasAsync(especialidade);
        return Ok(lista);
    }

    // GET api/IntervencoesCatalogo/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(int id)
    {
        var item = await _service.ObterPorIdAsync(id);
        if (item is null) return NotFound(new { mensagem = "Intervenção não encontrada." });
        return Ok(item);
    }

    // POST api/IntervencoesCatalogo
    [HttpPost]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Criar([FromBody] IntervencaoCatalogoCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var criado = await _service.CriarAsync(dto);
        if (criado is null) return BadRequest(new { mensagem = "Erro ao criar intervenção." });

        return CreatedAtAction(nameof(Obter), new { id = criado.IntervencaoID }, criado);
    }

    // PUT api/IntervencoesCatalogo/{id}
    [HttpPut("{id}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] IntervencaoCatalogoCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var atualizado = await _service.AtualizarAsync(id, dto);
        if (atualizado is null) return NotFound(new { mensagem = "Intervenção não encontrada." });

        return Ok(atualizado);
    }

    // DELETE api/IntervencoesCatalogo/{id}
    [HttpDelete("{id}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var sucesso = await _service.EliminarAsync(id);
        if (!sucesso) return NotFound(new { mensagem = "Intervenção não encontrada." });
        return NoContent();
    }
}