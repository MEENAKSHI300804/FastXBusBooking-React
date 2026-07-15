using System.Security.Claims;
using FastX.Api.DTOs;
using FastX.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly BookingService _bookings;

    public BookingsController(BookingService bookings) => _bookings = bookings;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> List() =>
        Ok(await _bookings.ListForUserAsync(CurrentUserId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingInputDto dto)
    {
        try
        {
            var booking = await _bookings.CreateAsync(dto, CurrentUserId);
            return StatusCode(201, booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var booking = await _bookings.GetAsync(id, CurrentUserId);
        return booking == null ? NotFound() : Ok(booking);
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var booking = await _bookings.CancelAsync(id, CurrentUserId);
            return booking == null ? NotFound() : Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

[ApiController]
[Route("api/operator")]
[Authorize]
public class OperatorController : ControllerBase
{
    private readonly BookingService _bookings;
    private readonly DashboardService _dashboard;

    public OperatorController(BookingService bookings, DashboardService dashboard)
    {
        _bookings = bookings;
        _dashboard = dashboard;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsOperator => User.IsInRole("Operator");
    private bool IsAdmin => User.IsInRole("Admin");

    [HttpGet("bookings")]
    public async Task<IActionResult> ListBookings()
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        return Ok(await _bookings.ListForOperatorAsync(CurrentUserId));
    }

    [HttpPatch("bookings/{id:int}/refund")]
    public async Task<IActionResult> ProcessRefund(int id)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        try
        {
            var booking = await _bookings.ProcessRefundAsync(id, CurrentUserId);
            return booking == null ? NotFound() : Ok(booking);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        return Ok(await _dashboard.GetOperatorDashboardAsync(CurrentUserId));
    }
}
