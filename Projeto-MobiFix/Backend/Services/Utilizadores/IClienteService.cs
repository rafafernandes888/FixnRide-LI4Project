namespace Backend.Services;

using Backend.Models;

public interface IClienteService
{
    Task<ClienteDto?> ObterPorNifAsync(string nif);
}
