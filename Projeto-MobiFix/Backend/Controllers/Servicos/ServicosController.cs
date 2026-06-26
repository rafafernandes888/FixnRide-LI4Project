namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ServicosController : ControllerBase
{
    private readonly IServicoService _servicoService;

    public ServicosController(IServicoService servicoService)
    {
        _servicoService = servicoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTodos()
    {
        var servicos = await _servicoService.ListarTodosAsync();
        return Ok(servicos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPorId(int id)
    {
        var servico = await _servicoService.ObterPorIdAsync(id);
        if (servico == null) return NotFound();
        return Ok(servico);
    }

    // Cliente agenda diagnóstico (cria serviço)
    [HttpPost]
    [Authorize(Policy = "TodosAutenticados")]
    public async Task<IActionResult> Criar([FromBody] ServicoCriacaoDto dto)
    {
        var novoServico = await _servicoService.CriarServicoDiagnosticoAsync(dto);
        if (novoServico == null) return BadRequest(new { mensagem = "Erro ao criar serviço." });

        return CreatedAtAction(nameof(GetPorId), new { id = novoServico.ServicoID }, novoServico);
    }

    // PUT api/servicos/{id} — atualização parcial (estado, diagnóstico, preço, histórico)
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOuMecanico")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ServicoAtualizacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var atualizado = await _servicoService.AtualizarServicoAsync(id, dto);
        if (atualizado is null) return NotFound(new { mensagem = "Serviço não encontrado ou erro ao atualizar." });
        return Ok(atualizado);
    }

    // GET api/servicos/prontas — trotinetes reparadas a aguardar levantamento
    [HttpGet("prontas")]
    public async Task<IActionResult> GetProntas()
    {
        var prontas = await _servicoService.ListarProntasAsync();
        return Ok(prontas);
    }

    // PUT api/servicos/{id}/fechar — confirma levantamento (Estado=FECHADO)
    [HttpPut("{id:int}/fechar")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> Fechar(int id)
    {
        var ok = await _servicoService.FecharServicoAsync(id);
        if (!ok) return NotFound(new { mensagem = "Serviço não encontrado ou erro ao fechar." });
        return NoContent();
    }

    // PUT api/servicos/{id}/levantar — emite fatura do serviço + fecha (atómico)
    [HttpPut("{id:int}/levantar")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> LevantarComFatura(int id, [FromBody] LevantarTrotineteDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var resultado = await _servicoService.LevantarComFaturaAsync(id, dto.MetodoPagamento);
        if (resultado is null)
            return BadRequest(new { mensagem = "Erro ao emitir fatura/levantar trotinete." });

        return Ok(resultado);
    }
}