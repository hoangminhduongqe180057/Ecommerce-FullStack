using AspNetCoreRateLimit;
using Ecom.Api.Authorization;
using Ecom.Api.Infrastructure;
using Ecom.Api.Interface;
using Ecom.Api.Provider;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using Serilog;
using Serilog.Events;
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

// === 1. Configure Serilog for bootstrap logging ===
// This initial logger catches issues during app startup.
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting web application");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for all application logging, reading from appsettings.json
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

    // === 2. Add services to the DI container ===

    // --- Performance & Security Services ---

    // Add Memory Cache for Rate Limiting
    builder.Services.AddMemoryCache();

    // Configure and Add Rate Limiting services
    builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
    builder.Services.AddInMemoryRateLimiting();
    builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

    // Add CORS - Read from environment variable or config
    var frontendOrigin = builder.Configuration["FRONTEND_ORIGIN"];
    var corsOrigins = !string.IsNullOrEmpty(frontendOrigin)
        ? new[] { frontendOrigin }
        : builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();

    if (corsOrigins.Length == 0)
    {
        Log.Warning("⚠️ No CORS origins configured! Set FRONTEND_ORIGIN env var or Cors:Origins in config.");
    }
    else
    {
        Log.Information("✅ CORS enabled for origins: {Origins}", string.Join(", ", corsOrigins));
    }

    builder.Services.AddCors(opt =>
        opt.AddPolicy("FE", p => p
            .WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));

    // Add Response Compression
    builder.Services.AddResponseCompression(opts =>
    {
        opts.EnableForHttps = true;
        opts.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/json" });
    });

    // --- Application Services ---

    // Register HttpClientFactory for Supabase Auth Service
    builder.Services.AddHttpClient("Supabase");

    // Register the Payment Provider to resolve the dependency injection error.
    builder.Services.AddSingleton<IPaymentProvider, StripePaymentProvider>();
    
    // Register Supabase Auth Service
    builder.Services.AddScoped<ISupabaseAuthService, SupabaseAuthService>();

    builder.Services.AddControllers().AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        );
    });

    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssemblyContaining<CreateProductRequestValidator>();

    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Ecom.Api", Version = "v1" });

        var scheme = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập: Bearer {token}",
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Paste access token (không cần chữ 'Bearer ')"
        });

        c.OperationFilter<SecurityRequirementsOperationFilter>(true, "Bearer");


        // QUAN TRỌNG: tự động thêm security cho operation có [Authorize]
        c.OperationFilter<Swashbuckle.AspNetCore.Filters.SecurityRequirementsOperationFilter>();
    });

    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy(Policies.AdminOnly, policy =>
            policy.Requirements.Add(new AdminRoleRequirement()));
    });

    builder.Services.AddSingleton<IAuthorizationHandler, AdminRoleHandler>();

    builder.Services.AddOpenApi();

    // Configure DBContext with PostgreSQL
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");

    // BẬT dynamic JSON cho Npgsql
    var dsb = new NpgsqlDataSourceBuilder(connStr);
    dsb.EnableDynamicJson(); // <<—— quan trọng
    var dataSource = dsb.Build();

    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddDbContext<AppDbContext>(opts =>
        {
            opts.UseNpgsql(dataSource, o => o.CommandTimeout(60));
            opts.EnableDetailedErrors();
            opts.EnableSensitiveDataLogging();
            opts.LogTo(Console.WriteLine, LogLevel.Information);
        });
    }
    else
    {
        builder.Services.AddDbContext<AppDbContext>(opts =>
            opts.UseNpgsql(dataSource, o => o.CommandTimeout(60)));
    }


    // Configure Authentication with Supabase JWT (HS256)
    builder.Services
        .AddAuthentication(o =>
        {
            o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(o =>
        {
            o.MapInboundClaims = false;
            o.IncludeErrorDetails = true;   // helpful khi debug
            o.SaveToken = true;

            var jwtIssuer = builder.Configuration["SupabaseAuth:JwtIssuer"];
            var jwtAudience = builder.Configuration["SupabaseAuth:JwtAudience"];
            var jwtSecret = builder.Configuration["SupabaseAuth:JwtSecret"];

            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSecret!)
                ),

                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                RequireSignedTokens = true,
                RoleClaimType = "role"
            };

            // (tuỳ chọn) bỏ qua HTTPS metadata khi chạy local HTTP
            // o.RequireHttpsMetadata = false;

            o.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = ctx =>
                {
                    Log.Warning(ctx.Exception, "JWT auth failed");
                    return Task.CompletedTask;
                }
            };
        });


    var app = builder.Build();

    // === 3. Configure the HTTP request pipeline (Middleware) ===
    // The order of middleware is CRITICAL for correct functionality.

    // 1. Compression should be early to compress as many responses as possible.
    app.UseResponseCompression();

    // 2. Rate Limiting should be early to block excessive requests quickly.
    app.UseIpRateLimiting();

    // 3. Serilog request logging to log details of every request.
    app.UseSerilogRequestLogging();

    // 4. Configure Swagger - Enable in all environments for API documentation
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecom.Api v1");
        c.RoutePrefix = "swagger"; // Access at /swagger
    });
    
    // Alternative minimal UI at root (only in Development)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwaggerUI(opt =>
        {
            opt.ConfigObject.AdditionalItems["persistAuthorization"] = true;
        });

    }
    else

    {
        // In Production, only enable Swagger for authenticated users.
        app.UseWhen(ctx => ctx.User.Identity?.IsAuthenticated == true, subApp =>
        {
            subApp.UseSwagger();
            subApp.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecom.Api v1");
                c.RoutePrefix = "docs"; // Access Swagger UI at /docs
            });
        });
    }

    // 5. Redirect HTTP to HTTPS.
    app.UseHttpsRedirection();

    // 6. Apply the CORS policy. Must be before Authentication/Authorization.
    app.UseCors("FE");

    // 7. Authentication middleware - identifies the user from the request.
    app.UseAuthentication();

    // 8. Authorization middleware - determines if the user is permitted to access a resource.
    app.UseAuthorization();

    // 9. Map controller endpoints.
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    // Log any fatal error that occurs during startup
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    // Ensure all logs are flushed before the application closes
    Log.CloseAndFlush();
}