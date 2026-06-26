namespace Backend.Services;

using Backend.Controllers;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// DelegatingHandler que lê o token JWT do HttpContext atual (header Authorization
/// ou cookie httpOnly) e o propaga no header Authorization de cada pedido HTTP
/// feito à Data API. Deve ser registado em todos os HttpClients excepto o do PecaService.
/// </summary>
public class JwtPropagationHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public JwtPropagationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var httpContext = _httpContextAccessor.HttpContext;

        if (httpContext is not null)
        {
            string? token = null;

            var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) &&
                authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = authHeader["Bearer ".Length..].Trim();
            }
            else if (httpContext.Request.Cookies.TryGetValue(AuthController.AuthCookieName, out var cookieToken))
            {
                token = cookieToken;
            }

            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        return base.SendAsync(request, cancellationToken);
    }
}
