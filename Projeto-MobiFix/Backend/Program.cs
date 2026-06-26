using DotNetEnv;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Backend.Controllers;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

// CARREGA O FICHEIRO .ENV
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Adiciona as variáveis do sistema (incluindo as do .env) ao Configuration
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers().AddJsonOptions(options =>
    {
        // Isto impede o C# de converter "Nome" em "nome"
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });;
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "MobiFix API", Version = "v1" });

    // Define o esquema de segurança JWT
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando o esquema Bearer. Exemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddAuthorization(options =>
{
    // Políticas baseadas no claim customizado "cargo" emitido pelo AuthService
    options.AddPolicy("ApenasCliente",    p => p.RequireClaim("cargo", "Cliente"));
    options.AddPolicy("ApenasStaff",      p => p.RequireClaim("cargo", "ADMINISTRADOR", "MECANICO", "OPERADOR"));
    options.AddPolicy("ApenasAdmin",      p => p.RequireClaim("cargo", "ADMINISTRADOR"));
    options.AddPolicy("AdminOuOperador",  p => p.RequireClaim("cargo", "ADMINISTRADOR", "OPERADOR"));
    options.AddPolicy("AdminOuMecanico",  p => p.RequireClaim("cargo", "ADMINISTRADOR", "MECANICO"));
    options.AddPolicy("TodosAutenticados",p => p.RequireClaim("cargo",
        "Cliente", "ADMINISTRADOR", "MECANICO", "OPERADOR"));
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Registo da white/black list de tokens (singleton — partilhada por todos os pedidos)
builder.Services.AddSingleton<ITokenListService, TokenListService>();

var dataApiUrl = builder.Configuration["DATA_API_URL"]
                 ?? throw new Exception("DATA_API_URL não definida");
var internalApiKey = builder.Configuration["INTERNAL_API_KEY"]
                     ?? throw new Exception("INTERNAL_API_KEY não definida");

void ConfigureDefaultClient(HttpClient client)
{
    client.BaseAddress = new Uri(dataApiUrl);
    client.DefaultRequestHeaders.Add("x-api-key", internalApiKey);
}

// Permite aceder ao HttpContext dentro dos DelegatingHandlers
builder.Services.AddHttpContextAccessor();

// Handler que propaga o JWT do frontend para a Data API (todos os clientes excepto PecaService)
builder.Services.AddTransient<JwtPropagationHandler>();

// PecaService: GET /pecas é público, mas POST/PUT/PATCH exigem JWT — propaga o token
builder.Services.AddHttpClient<IPecaService, PecaService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();

// Todos os outros clientes propagam o JWT do utilizador autenticado
builder.Services.AddHttpClient<IAuthService, AuthService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<ITrotineteService, TrotineteService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IFuncionarioService, FuncionarioService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IFaturaService, FaturaService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IIntervencaoCatalogoService, IntervencaoCatalogoService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IServicoService, ServicoService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IAgendaService, AgendaService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IEncomendaClienteService, EncomendaClienteService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IPromocaoService, PromocaoService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IEncomendaStockService, EncomendaStockService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IEstatisticasService, EstatisticasService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IVendaService, VendaService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddHttpClient<IClienteService, ClienteService>(ConfigureDefaultClient)
    .AddHttpMessageHandler<JwtPropagationHandler>();
builder.Services.AddSingleton<IEmailService, EmailService>();

// Configuração JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]
    ?? throw new InvalidOperationException("JwtSettings:SecretKey não está configurado.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        options.Events = new JwtBearerEvents
        {
            // Permite autenticar via cookie httpOnly quando o header Authorization
            // não está presente — sem mexer em controllers ou clients.
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(AuthController.AuthCookieName, out var cookieToken))
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            },

            // Rejeita tokens que tenham sido revogados ou que não estejam na whitelist.
            OnTokenValidated = context =>
            {
                var jti = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
                var tokenList = context.HttpContext.RequestServices.GetRequiredService<ITokenListService>();
                if (string.IsNullOrEmpty(jti) || !tokenList.IsAllowed(jti))
                    context.Fail("Token revogado ou não reconhecido.");
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();