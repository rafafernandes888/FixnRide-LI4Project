namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "TodosAutenticados")]
public class PromocoesController : ControllerBase
{
    private readonly IPromocaoService _promocaoService;

    public PromocoesController(IPromocaoService promocaoService)
    {
        _promocaoService = promocaoService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var promocoes = await _promocaoService.GetPromocoesAsync();
        return Ok(promocoes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(string id)
    {
        var promocao = await _promocaoService.GetPromocaoPorIdAsync(id);
        if (promocao == null) return NotFound(new { mensagem = "Promoção não encontrada." });
        return Ok(promocao);
    }

    [HttpPost]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Criar([FromBody] PromocaoCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var novaPromocao = await _promocaoService.CriarPromocaoAsync(dto);
        if (novaPromocao == null)
            return BadRequest(new { mensagem = "Erro ao criar promoção." });

        return CreatedAtAction(nameof(Obter), new { id = novaPromocao.PromocaoID }, novaPromocao);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] PromocaoDto dto)
    {
        var promocao = await _promocaoService.AtualizarPromocaoAsync(id, dto);
        if (promocao == null) return NotFound(new { mensagem = "Promoção não encontrada." });
        return Ok(promocao);
    }

    [HttpPatch("{id}/estado")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> AlterarEstado(string id, [FromBody] AlterarEstadoRequest request)
    {
        var promocao = await _promocaoService.AlterarEstadoAsync(id, request.Ativa);
        if (promocao == null) return NotFound(new { mensagem = "Promoção não encontrada." });
        return Ok(promocao);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Eliminar(string id)
    {
        var sucesso = await _promocaoService.EliminarPromocaoAsync(id);
        if (!sucesso) return NotFound(new { mensagem = "Promoção não encontrada." });
        return NoContent();
    }
}

public class AlterarEstadoRequest
{
    public bool Ativa { get; set; }
}
