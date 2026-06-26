namespace Backend.Services;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _user;
    private readonly string _pass;
    private readonly string _from;
    private readonly string _fromName;
    private readonly bool _enabled;

    public EmailService(IConfiguration config)
    {
        _host = config["SMTP_HOST"] ?? "";
        _port = int.TryParse(config["SMTP_PORT"], out var p) ? p : 587;
        _user = config["SMTP_USER"] ?? "";
        _pass = config["SMTP_PASS"] ?? "";
        _from = config["SMTP_FROM"] ?? _user;
        _fromName = config["SMTP_FROM_NAME"] ?? "MobiFix";
        _enabled = !string.IsNullOrWhiteSpace(_host) && !string.IsNullOrWhiteSpace(_from);
    }

    public async Task EnviarAsync(string para, string assunto, string corpoHtml)
    {
        if (!_enabled)
        {
            Console.WriteLine($"[Email] SMTP não configurado — e-mail para {para} ({assunto}) ignorado.");
            return;
        }
        if (string.IsNullOrWhiteSpace(para))
        {
            Console.WriteLine($"[Email] Destinatário vazio — e-mail ({assunto}) ignorado.");
            return;
        }

        try
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress(_fromName, _from));
            msg.To.Add(MailboxAddress.Parse(para));
            msg.Subject = assunto;
            msg.Body = new BodyBuilder { HtmlBody = corpoHtml }.ToMessageBody();

            using var smtp = new SmtpClient();
            var secureOpt = _port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            await smtp.ConnectAsync(_host, _port, secureOpt);
            if (!string.IsNullOrWhiteSpace(_user))
                await smtp.AuthenticateAsync(_user, _pass);
            await smtp.SendAsync(msg);
            await smtp.DisconnectAsync(true);

            Console.WriteLine($"[Email] Enviado para {para}: {assunto}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Email] Erro ao enviar para {para}: {ex.Message}");
        }
    }

    public Task NotificarTrotineteProntaAsync(string emailCliente, string nomeCliente, int servicoId, string trotineteNumSerie, decimal valor)
    {
        var corpo = $@"
<!DOCTYPE html>
<html><body style='font-family: Arial, sans-serif; color:#1e293b;'>
  <div style='max-width:560px;margin:0 auto;padding:24px;'>
    <div style='background:#2563eb;color:#fff;padding:20px;border-radius:12px 12px 0 0;'>
      <h1 style='margin:0;font-size:22px;'>MobiFix — Trotinete Pronta</h1>
    </div>
    <div style='background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:0;'>
      <p>Olá <strong>{nomeCliente}</strong>,</p>
      <p>A sua trotinete (nº de série <strong>{trotineteNumSerie}</strong>) está <strong>pronta para levantamento</strong> na nossa loja.</p>
      <p><strong>Ordem de serviço:</strong> #{servicoId}<br/>
      <strong>Valor a pagar:</strong> €{valor.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</p>
      <p>Dirija-se à loja com o seu documento de identificação para proceder ao levantamento e pagamento.</p>
      <p style='color:#64748b;font-size:13px;margin-top:24px;'>Este é um e-mail automático — por favor não responda.</p>
    </div>
  </div>
</body></html>";
        return EnviarAsync(emailCliente, $"[MobiFix] Trotinete pronta para levantamento (serviço #{servicoId})", corpo);
    }

    public Task EnviarFaturaAsync(string emailCliente, string nomeCliente, string numeroFatura, decimal valor, string metodoPagamento, string? descricao)
    {
        var desc = string.IsNullOrWhiteSpace(descricao) ? "Transação MobiFix" : descricao;
        var corpo = $@"
<!DOCTYPE html>
<html><body style='font-family: Arial, sans-serif; color:#1e293b;'>
  <div style='max-width:560px;margin:0 auto;padding:24px;'>
    <div style='background:#0f172a;color:#fff;padding:20px;border-radius:12px 12px 0 0;'>
      <h1 style='margin:0;font-size:22px;'>MobiFix — Fatura emitida</h1>
    </div>
    <div style='background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:0;'>
      <p>Olá <strong>{nomeCliente}</strong>,</p>
      <p>Foi emitida uma fatura no seu nome:</p>
      <table style='width:100%;border-collapse:collapse;margin:16px 0;'>
        <tr><td style='padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;'>Número</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;'><strong>{numeroFatura}</strong></td></tr>
        <tr><td style='padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;'>Descrição</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;'>{desc}</td></tr>
        <tr><td style='padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;'>Método</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;'>{metodoPagamento}</td></tr>
        <tr><td style='padding:8px;color:#64748b;'>Total</td><td style='padding:8px;'><strong style='color:#16a34a;'>€{valor.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)}</strong></td></tr>
      </table>
      <p>Pode consultar e descarregar esta fatura na sua área pessoal da aplicação.</p>
      <p style='color:#64748b;font-size:13px;margin-top:24px;'>Obrigado pela sua preferência.</p>
    </div>
  </div>
</body></html>";
        return EnviarAsync(emailCliente, $"[MobiFix] Fatura {numeroFatura}", corpo);
    }
}
