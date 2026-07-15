using FastX.Api.DTOs;
using FastX.Api.Models;
using FastX.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto dto)
    {
        try
        {
            var result = await _auth.RegisterAsync(dto);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already registered"))
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _auth.LoginAnyRoleAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }

    [HttpPost("operator/register")]
    public async Task<IActionResult> RegisterOperator([FromBody] OperatorRegistrationDto dto)
    {
        try
        {
            var result = await _auth.RegisterOperatorAsync(dto);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already registered"))
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("operator/login")]
    public async Task<IActionResult> LoginOperator([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _auth.LoginAsync(dto, UserRole.Operator);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
    }
}
