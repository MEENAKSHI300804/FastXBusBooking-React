using System.ComponentModel.DataAnnotations;

namespace FastX.Api.DTOs;

public class RouteDetailDto
{
    public int Id { get; set; }
    public int BusId { get; set; }
    public string? BusName { get; set; }
    public string? BusNumber { get; set; }
    public string? BusType { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public decimal Fare { get; set; }
    public int AvailableSeats { get; set; }
    public int TotalSeats { get; set; }
    public string Status { get; set; } = string.Empty;
    public AmenitiesDto? Amenities { get; set; }
    public string? OperatorName { get; set; }
}

public class RouteInputDto
{
    [Required]
    public int BusId { get; set; }
    [Required]
    public string Origin { get; set; } = string.Empty;
    [Required]
    public string Destination { get; set; } = string.Empty;
    [Required]
    public DateTime DepartureTime { get; set; }
    [Required]
    public DateTime ArrivalTime { get; set; }
    [Range(0, double.MaxValue)]
    public decimal Fare { get; set; }
}

public class SeatDto
{
    public int Id { get; set; }
    public string SeatNumber { get; set; } = string.Empty;
    public bool IsBooked { get; set; }
    public int? SeatRow { get; set; }
    public string? SeatCol { get; set; }
}
