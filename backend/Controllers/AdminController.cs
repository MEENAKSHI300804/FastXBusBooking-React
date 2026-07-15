using FastX.Api.Data;
using FastX.Api.Models;
using FastX.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly FastXDbContext _db;
    private readonly BookingService _bookings;
    private readonly DashboardService _dashboard;

    public AdminController(FastXDbContext db, BookingService bookings, DashboardService dashboard)
    {
        _db = db;
        _bookings = bookings;
        _dashboard = dashboard;
    }

    [HttpGet("users")]
    public async Task<IActionResult> ListUsers()
    {
        var users = await _db.Users
            .Where(u => u.Role == UserRole.Passenger)
            .Select(u => AuthService.MapToProfile(u))
            .ToListAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null || user.Role != UserRole.Passenger) return NotFound();
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("operators")]
    public async Task<IActionResult> ListOperators()
    {
        var operators = await _db.Users
            .Where(u => u.Role == UserRole.Operator)
            .Select(u => AuthService.MapToProfile(u))
            .ToListAsync();
        return Ok(operators);
    }

    [HttpDelete("operators/{id:int}")]
    public async Task<IActionResult> DeleteOperator(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null || user.Role != UserRole.Operator) return NotFound();
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> ListBookings() =>
        Ok(await _bookings.ListAllAsync());

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() =>
        Ok(await _dashboard.GetAdminDashboardAsync());
}
