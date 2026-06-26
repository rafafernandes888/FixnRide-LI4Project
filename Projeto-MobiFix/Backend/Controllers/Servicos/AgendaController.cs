namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgendaController : ControllerBase
{
    private readonly IAgendaService _agendaService;
    private readonly IFuncionarioService _funcionarioService; // 1. Adicionado

    // Injectar ambos os serviços no construtor
    public AgendaController(IAgendaService agendaService, IFuncionarioService funcionarioService)
    {
        _agendaService = agendaService;
        _funcionarioService = funcionarioService; // 1. Adicionado
    }

    [HttpGet]
    [Authorize(Policy = "AdminOuMecanico")]
    public async Task<IActionResult> Listar()
    {
        var agenda = await _agendaService.ListarAgendaAsync();
        return Ok(agenda);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOuMecanico")]
    public async Task<IActionResult> Obter(int id)
    {
        var slot = await _agendaService.ObterSlotPorIdAsync(id);
        if (slot == null) return NotFound(new { mensagem = "Slot de agenda não encontrado." });
        return Ok(slot);
    }

    // Cliente e Staff podem criar slots (agendamento de diagnóstico)
    [HttpPost]
    [Authorize(Policy = "TodosAutenticados")]
    public async Task<IActionResult> Criar([FromBody] AgendaCriacaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var funcionarios = await _funcionarioService.ListarFuncionariosAsync();
        var mecanicos = funcionarios.Where(f => f.Cargo == "MECANICO").ToList();

        string mecanicoEscolhido = "000"; 

        if (mecanicos.Any())
        {
            // 2. Escolha Aleatória
            var random = new Random();
            int indice = random.Next(mecanicos.Count);
            mecanicoEscolhido = mecanicos[indice].NumeroMecanografico;
        }

        dto.MecanicoNumero = mecanicoEscolhido;
        
        dto.Estado ??= "AGENDADO";

        var novoSlot = await _agendaService.CriarSlotAsync(dto);
        
        if (novoSlot == null) 
            return BadRequest(new { mensagem = "Erro ao criar slot na agenda." });

        return CreatedAtAction(nameof(Obter), new { id = novoSlot.AgendaID }, novoSlot);
    }

   [HttpPut("{id}")]
    [Authorize(Policy = "AdminOuMecanico")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] AgendaDto dto)
    {
        var resultado = await _agendaService.AtualizarSlotAsync(id, dto);
        if (resultado == null) return NotFound();

        return Ok(resultado); // Retornamos 200 OK com o objeto
    } 
    [HttpDelete("{id}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var sucesso = await _agendaService.EliminarSlotAsync(id);
        if (!sucesso) return NotFound(new { mensagem = "Slot não encontrado." });
        
        return NoContent();
    }
}