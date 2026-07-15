using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FastX.Api.Data;
using FastX.Api.DTOs;
using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FastX.Api.Services;

public class AuthService
{
    private readonly FastXDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(FastXDbContext db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(UserRegistrationDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Name = dto.Name,
            Gender = dto.Gender,
            Phone = dto.Phone,
            Address = dto.Address,
            Role = UserRole.Passenger
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Passenger registered: {Email}", user.Email);

        return new AuthResponseDto { Token = GenerateToken(user), User = MapToProfile(user) };
    }

    public async Task<AuthResponseDto> RegisterOperatorAsync(OperatorRegistrationDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = dto.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Name = dto.Name,
            Phone = dto.Phone,
            CompanyName = dto.CompanyName,
            Address = dto.Address,
            Role = UserRole.Operator
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Operator registered: {Email}", user.Email);

        return new AuthResponseDto { Token = GenerateToken(user), User = MapToProfile(user) };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, UserRole expectedRole)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Email == dto.Email.ToLower() && u.Role == expectedRole);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        _logger.LogInformation("User logged in: {Email}", user.Email);
        return new AuthResponseDto { Token = GenerateToken(user), User = MapToProfile(user) };
    }

    public async Task<AuthResponseDto> LoginAnyRoleAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        _logger.LogInformation("User logged in: {Email} ({Role})", user.Email, user.Role);
        return new AuthResponseDto { Token = GenerateToken(user), User = MapToProfile(user) };
    }

    public string GenerateToken(User user)
    {
        var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static UserProfileDto MapToProfile(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        Name = user.Name,
        Gender = user.Gender,
        Phone = user.Phone,
        Address = user.Address,
        Role = user.Role.ToString().ToLower(),
        CompanyName = user.CompanyName,
        CreatedAt = user.CreatedAt
    };
}
