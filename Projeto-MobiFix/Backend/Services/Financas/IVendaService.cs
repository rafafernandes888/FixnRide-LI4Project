namespace Backend.Services;

using Backend.Models;

public interface IVendaService
{
    Task<IEnumerable<VendaDto>> ListarVendasAsync();
    Task<VendaDto?> ObterVendaAsync(int id);
    Task<VendaComFaturaDto?> RegistarVendaDiretaAsync(string operadorNumero, CheckoutVendaDiretaDto dto);
}
