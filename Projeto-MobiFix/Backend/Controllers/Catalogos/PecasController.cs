namespace Backend.Controllers;

using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;

[ApiController]
[Route("api/[controller]")]
public class PecasController : ControllerBase
{
    private readonly IPecaService _pecaService;
    
    public PecasController(IPecaService pecaService)
    {
        _pecaService = pecaService;
    }

    // GET: api/pecas
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try 
        {
            var pecas = await _pecaService.GetTodasPecasAsync();
            return Ok(pecas);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET: api/pecas/{ean}
    [HttpGet("{ean}")]
    public async Task<IActionResult> ObterPorEan(string ean)
    {
        try
        {
            var peca = await _pecaService.GetPecaPorEanAsync(ean);
            
            if (peca == null) 
            {
                return NotFound(new { mensagem = "Peça não encontrada." });
            }
            
            return Ok(peca);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/pecas
    [HttpPost]
    [Authorize(Policy = "ApenasAdmin")]
    // CORREÇÃO AQUI: Mudou de Peca para PecaDto
    public async Task<IActionResult> CriarPeca([FromBody] PecaDto novaPeca) 
    {
        try
        {
            var pecaCriada = await _pecaService.CriarPecaAsync(novaPeca);
            
            if (pecaCriada == null) return BadRequest(new { error = "Não foi possível criar a peça na Data API." });

            return CreatedAtAction(nameof(ObterPorEan), new { ean = pecaCriada.CodigoEAN }, pecaCriada);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: api/pecas/{ean}
    [HttpPut("{ean}")]
    [Authorize(Policy = "ApenasAdmin")]
    // CORREÇÃO AQUI: Mudou de Peca para PecaDto
    public async Task<IActionResult> AtualizarPeca(string ean, [FromBody] PecaDto pecaAtualizada)
    {
        try
        {
            var peca = await _pecaService.AtualizarPecaAsync(ean, pecaAtualizada);
            
            if (peca == null) 
            {
                return NotFound(new { mensagem = "Peça não encontrada ou erro na atualização." });
            }
            
            return Ok(peca);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PATCH: api/pecas/{ean}/estado
    [HttpPatch("{ean}/estado")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> AlterarEstado(string ean, [FromBody] EstadoPecaDto estadoDto)
    {
        try
        {
            var peca = await _pecaService.AlterarEstadoPecaAsync(ean, estadoDto.Ativo);
            
            if (peca == null) 
            {
                return NotFound(new { mensagem = "Peça não encontrada ou erro ao alterar estado." });
            }
            
            return Ok(peca);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // DELETE: api/pecas/{ean}
    [HttpDelete("{ean}")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> EliminarPeca(string ean)
    {
        try
        {
            var sucesso = await _pecaService.EliminarPecaAsync(ean);

            if (!sucesso)
            {
                return NotFound(new { mensagem = "Peça não encontrada." });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private static readonly HashSet<string> MimeImagensAceites = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    };

    // GET: api/pecas/{ean}/imagem — devolve o binário da imagem (público)
    [HttpGet("{ean}/imagem")]
    [AllowAnonymous]
    public async Task<IActionResult> ObterImagem(string ean)
    {
        try
        {
            var resultado = await _pecaService.ObterImagemAsync(ean);
            if (resultado is null) return NotFound(new { mensagem = "Imagem não encontrada." });

            Response.Headers["Cache-Control"] = "public, max-age=300";
            return File(resultado.Value.Conteudo, resultado.Value.ContentType);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/pecas/{ean}/imagem — upload via multipart/form-data (campo "ficheiro")
    [HttpPost("{ean}/imagem")]
    [Authorize(Policy = "ApenasAdmin")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadImagem(string ean, IFormFile? ficheiro)
    {
        if (ficheiro is null || ficheiro.Length == 0)
            return BadRequest(new { error = "Ficheiro não fornecido." });

        var contentType = ficheiro.ContentType?.ToLowerInvariant() ?? string.Empty;
        if (!MimeImagensAceites.Contains(contentType))
            return StatusCode(StatusCodes.Status415UnsupportedMediaType,
                new { error = $"Tipo de imagem não suportado: {contentType}." });

        try
        {
            await using var stream = ficheiro.OpenReadStream();
            var atualizada = await _pecaService.UploadImagemAsync(ean, stream, contentType);
            if (atualizada is null)
                return BadRequest(new { error = "Não foi possível guardar a imagem." });

            return Ok(atualizada);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // DELETE: api/pecas/{ean}/imagem — remove a imagem associada
    [HttpDelete("{ean}/imagem")]
    [Authorize(Policy = "ApenasAdmin")]
    public async Task<IActionResult> EliminarImagem(string ean)
    {
        try
        {
            var atualizada = await _pecaService.EliminarImagemAsync(ean);
            if (atualizada is null)
                return NotFound(new { mensagem = "Peça não encontrada." });

            return Ok(atualizada);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}