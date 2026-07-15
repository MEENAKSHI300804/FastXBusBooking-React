using System.ComponentModel.DataAnnotations;

namespace FastX.Api.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public int RouteId { get; set; }
    public string? Origin { get; set; }
    public string? Destination { get; set; }
    public DateTime? DepartureTime { get; set; }
    public List<string> SeatNumbers { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? BusName { get; set; }
    public string? BusNumber { get; set; }
}

public class BookingInputDto
{
    [Required]
    public int RouteId { get; set; }
    [Required, MinLength(1)]
    public List<int> SeatIds { get; set; } = new();
}

public class DashboardSummaryDto
{
    public int TotalBookings { get; set; }
    public int UpcomingJourneys { get; set; }
    public int CancelledBookings { get; set; }
    public decimal TotalSpent { get; set; }
    public List<BookingDto> RecentBookings { get; set; } = new();
}

public class RouteStatsDto
{
    public int RouteId { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int BookingCount { get; set; }
    public decimal Revenue { get; set; }
}

public class OperatorDashboardDto
{
    public int TotalBuses { get; set; }
    public int TotalRoutes { get; set; }
    public int TotalBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingRefunds { get; set; }
    public List<BookingDto> RecentBookings { get; set; } = new();
    public List<RouteStatsDto> PopularRoutes { get; set; } = new();
}

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalOperators { get; set; }
    public int TotalRoutes { get; set; }
    public int TotalBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<BookingDto> RecentBookings { get; set; } = new();
}
