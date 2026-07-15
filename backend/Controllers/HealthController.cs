using Microsoft.AspNetCore.Mvc;

namespace FastX.Api.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("healthz")]
    public IActionResult Health() => Ok(new { status = "healthy" });
}
