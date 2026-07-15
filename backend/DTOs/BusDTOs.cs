using System.ComponentModel.DataAnnotations;

namespace FastX.Api.DTOs;

public class AmenitiesDto
{
    public bool WaterBottle { get; set; }
    public bool ChargingPoint { get; set; }
    public bool Tv { get; set; }
    public bool Blanket { get; set; }
}

public class BusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BusNumber { get; set; } = string.Empty;
    public string BusType { get; set; } = string.Empty;
    public int TotalSeats { get; set; }
    public int OperatorId { get; set; }
    public string? OperatorName { get; set; }
    public AmenitiesDto Amenities { get; set; } = new();
}

public class BusInputDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public string BusNumber { get; set; } = string.Empty;
    [Required]
    public string BusType { get; set; } = string.Empty;
    [Range(10, 60)]
    public int TotalSeats { get; set; }
    public AmenitiesDto? Amenities { get; set; }
}
