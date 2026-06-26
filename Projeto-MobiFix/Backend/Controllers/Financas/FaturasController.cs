namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class FaturasController : ControllerBase
{
    private readonly IFaturaService _faturaService;

    public FaturasController(IFaturaService faturaService)
    {
        _faturaService = faturaService;
    }

    // Admin e Operador vêem todas as faturas
    [HttpGet]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> Listar()
    {
        var faturas = await _faturaService.GetFaturasAsync();
        return Ok(faturas);
    }

    // Cliente vê as suas próprias faturas
    [HttpGet("minhas")]
    [Authorize(Policy = "ApenasCliente")]
    public async Task<IActionResult> ObterFaturasCliente()
    { 
        var clienteNIF = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(clienteNIF)) 
            return Unauthorized(new { mensagem = "Token inválido ou NIF não encontrado." });

        var faturas = await _faturaService.GetFaturasCliente(clienteNIF);
        
        if (faturas == null) return NotFound(new { mensagem = "O cliente não tem faturas" });
        
        return Ok(faturas);
    }

    // Admin, Operador ou Cliente podem consultar uma fatura por número
    [HttpGet("{numero}")]
    [Authorize(Policy = "TodosAutenticados")]
    public async Task<IActionResult> Obter(string numero)
    {
        var fatura = await _faturaService.GetFaturaPorNumeroAsync(numero);
        if (fatura == null) return NotFound(new { mensagem = "Fatura não encontrada." });
        return Ok(fatura);
    }

    // Criação de fatura é feita internamente pelo servidor LN (operador/admin)
    [HttpPost]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> Criar([FromBody] FaturaCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var novaFatura = await _faturaService.CriarFaturaAsync(dto);
        if (novaFatura == null) 
            return BadRequest(new { mensagem = "Erro ao criar fatura. Verifique se o número já existe." });

        return CreatedAtAction(nameof(Obter), new { numero = novaFatura.NumeroFatura }, novaFatura);
    }

    [HttpDelete("{numero}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Eliminar(string numero)
    {
        var sucesso = await _faturaService.EliminarFaturaAsync(numero);
        if (!sucesso) return NotFound(new { mensagem = "Fatura não encontrada." });

        return NoContent();
    }

    [HttpPost("{numero}/devolucao")]
    [Authorize(Policy = "AdminOuOperador")]
    public async Task<IActionResult> Devolver(string numero, [FromBody] DevolucaoCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var fatura = await _faturaService.ProcessarDevolucaoAsync(numero, dto.Motivo);
            if (fatura is null)
                return BadRequest(new { mensagem = "Não foi possível processar a devolução." });
            return Ok(fatura);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}