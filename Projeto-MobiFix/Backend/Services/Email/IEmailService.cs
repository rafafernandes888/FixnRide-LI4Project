namespace Backend.Services;

public interface IEmailService
{
    Task EnviarAsync(string para, string assunto, string corpoHtml);
    Task NotificarTrotineteProntaAsync(string emailCliente, string nomeCliente, int servicoId, string trotineteNumSerie, decimal valor);
    Task EnviarFaturaAsync(string emailCliente, string nomeCliente, string numeroFatura, decimal valor, string metodoPagamento, string? descricao);
}
