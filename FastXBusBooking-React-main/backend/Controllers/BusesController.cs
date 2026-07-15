using System.Security.Claims;
using FastX.Api.DTOs;
using FastX.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api/buses")]
[Authorize]
public class BusesController : ControllerBase
{
    private readonly BusService _buses;

    public BusesController(BusService buses) => _buses = buses;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("Admin");
    private bool IsOperator => User.IsInRole("Operator");

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var operatorId = IsAdmin ? null : (int?)CurrentUserId;
        var buses = await _buses.ListAsync(operatorId);
        return Ok(buses);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BusInputDto dto)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        try
        {
            var bus = await _buses.CreateAsync(dto, CurrentUserId);
            return StatusCode(201, bus);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var bus = await _buses.GetAsync(id);
        return bus == null ? NotFound() : Ok(bus);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] BusInputDto dto)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        var bus = await _buses.UpdateAsync(id, dto, CurrentUserId, IsAdmin);
        return bus == null ? NotFound() : Ok(bus);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        var deleted = await _buses.DeleteAsync(id, CurrentUserId, IsAdmin);
        return deleted ? NoContent() : NotFound();
    }
}
