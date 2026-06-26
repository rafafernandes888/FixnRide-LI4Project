namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VendasController : ControllerBase
{
    private readonly IVendaService _vendaService;

    public VendasController(IVendaService vendaService)
    {
        _vendaService = vendaService;
    }

    [HttpGet]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Listar()
    {
        var vendas = await _vendaService.ListarVendasAsync();
        return Ok(vendas);
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Obter(int id)
    {
        var venda = await _vendaService.ObterVendaAsync(id);
        if (venda is null) return NotFound(new { mensagem = "Venda não encontrada." });
        return Ok(venda);
    }

    // POST api/vendas/direta — venda direta em loja: cria Venda + Fatura num único passo.
    // O operador é obtido do JWT (claim "id" = NumeroMecanografico); o campo no body é ignorado.
    [HttpPost("direta")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> RegistarVendaDireta([FromBody] CheckoutVendaDiretaDto dto)
    {
        if (!ModelState.IsValid)
        {
            var erros = ModelState
                .Where(kv => kv.Value?.Errors.Count > 0)
                .ToDictionary(
                    kv => kv.Key,
                    kv => kv.Value!.Errors.Select(e => e.ErrorMessage).ToArray());
            Console.WriteLine("[VendaDireta] ModelState inválido: " + System.Text.Json.JsonSerializer.Serialize(erros));
            return BadRequest(new { mensagem = "Validação falhou.", erros });
        }

        var operadorNumero = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(operadorNumero))
            return Unauthorized(new { mensagem = "Token inválido ou operador não identificado." });

        var resultado = await _vendaService.RegistarVendaDiretaAsync(operadorNumero, dto);
        if (resultado is null)
            return BadRequest(new { mensagem = "Erro ao registar venda direta." });

        return CreatedAtAction(nameof(Obter), new { id = resultado.Venda.VendaID }, resultado);
    }
}
