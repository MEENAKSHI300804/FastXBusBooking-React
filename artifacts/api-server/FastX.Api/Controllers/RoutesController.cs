using System.Security.Claims;
using FastX.Api.DTOs;
using FastX.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api/routes")]
public class RoutesController : ControllerBase
{
    private readonly RouteService _routes;

    public RoutesController(RouteService routes) => _routes = routes;

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
    private bool IsAdmin => User.IsInRole("Admin");
    private bool IsOperator => User.IsInRole("Operator");

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string origin, [FromQuery] string destination, [FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });

        var routes = await _routes.SearchAsync(origin, destination, parsedDate);
        return Ok(routes);
    }

    [HttpGet("cities")]
    public async Task<IActionResult> Cities() => Ok(await _routes.GetCitiesAsync());

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> List()
    {
        var operatorId = IsAdmin ? null : (int?)CurrentUserId;
        return Ok(await _routes.ListAsync(operatorId));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] RouteInputDto dto)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        try
        {
            var route = await _routes.CreateAsync(dto, CurrentUserId);
            return StatusCode(201, route);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var route = await _routes.GetAsync(id);
        return route == null ? NotFound() : Ok(route);
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] RouteInputDto dto)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        var route = await _routes.UpdateAsync(id, dto, CurrentUserId, IsAdmin);
        return route == null ? NotFound() : Ok(route);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        if (!IsOperator && !IsAdmin) return Forbid();
        var deleted = await _routes.DeleteAsync(id, CurrentUserId, IsAdmin);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("{routeId:int}/seats")]
    public async Task<IActionResult> GetSeats(int routeId)
    {
        var route = await _routes.GetAsync(routeId);
        if (route == null) return NotFound();
        return Ok(await _routes.GetSeatsAsync(routeId));
    }
}
