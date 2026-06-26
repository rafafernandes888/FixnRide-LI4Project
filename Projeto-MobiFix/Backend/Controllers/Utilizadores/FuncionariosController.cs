namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "ApenasAdmin")]
public class FuncionariosController : ControllerBase
{
    private readonly IFuncionarioService _funcionarioService;

    public FuncionariosController(IFuncionarioService funcionarioService)
    {
        _funcionarioService = funcionarioService;
    }

    // POST api/funcionarios
    [HttpPost]
    public async Task<IActionResult> CriarFuncionario([FromBody] FuncionarioCriacaoDto criacaoDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var funcionario = await _funcionarioService.CriarFuncionarioAsync(criacaoDto);

        if (funcionario is null)
            return Conflict(new { mensagem = "Não foi possível criar o funcionário. O número mecanográfico já deve estar registado." });

        return Created(string.Empty, funcionario);
    }

    // GET api/funcionarios
    [HttpGet]
    public async Task<IActionResult> ListarFuncionarios()
    {
        var funcionarios = await _funcionarioService.ListarFuncionariosAsync();
        return Ok(funcionarios);
    }

    // GET api/funcionarios/{numeroMecanografico}
    [HttpGet("{numeroMecanografico}")]
    public async Task<IActionResult> ObterFuncionario(string numeroMecanografico)
    {
        var funcionario = await _funcionarioService.ObterFuncionarioPorNumeroAsync(numeroMecanografico);

        if (funcionario is null)
            return NotFound(new { mensagem = $"Funcionário '{numeroMecanografico}' não encontrado." });

        return Ok(funcionario);
    }

    // PUT api/funcionarios/{numeroMecanografico}
    [HttpPut("{numeroMecanografico}")]
    public async Task<IActionResult> AtualizarFuncionario(string numeroMecanografico, [FromBody] FuncionarioAtualizacaoDto atualizacaoDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var funcionario = await _funcionarioService.AtualizarFuncionarioAsync(numeroMecanografico, atualizacaoDto);

        if (funcionario is null)
            return NotFound(new { mensagem = $"Funcionário '{numeroMecanografico}' não encontrado ou não foi possível atualizar." });

        return Ok(funcionario);
    }
}