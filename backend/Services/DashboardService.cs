using FastX.Api.Data;
using FastX.Api.DTOs;
using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Services;

public class DashboardService
{
    private readonly FastXDbContext _db;

    public DashboardService(FastXDbContext db) => _db = db;

    public async Task<DashboardSummaryDto> GetUserSummaryAsync(int userId)
    {
        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;
        return new DashboardSummaryDto
        {
            TotalBookings = bookings.Count,
            UpcomingJourneys = bookings.Count(b =>
                b.Status == BookingStatus.Confirmed && b.Route?.DepartureTime > now),
            CancelledBookings = bookings.Count(b => b.Status == BookingStatus.Cancelled),
            TotalSpent = bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .Sum(b => b.TotalAmount),
            RecentBookings = bookings.Take(5).Select(BookingService.MapToDto).ToList()
        };
    }

    public async Task<OperatorDashboardDto> GetOperatorDashboardAsync(int operatorId)
    {
        var buses = await _db.Buses.CountAsync(b => b.OperatorId == operatorId);
        var routes = await _db.Routes.Include(r => r.Bus)
            .CountAsync(r => r.Bus.OperatorId == operatorId);

        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .Where(b => b.Route.Bus.OperatorId == operatorId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var revenue = bookings
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Refunded)
            .Sum(b => b.TotalAmount);

        var popularRoutes = await _db.Routes
            .Include(r => r.Bus)
            .Include(r => r.Bookings)
            .Where(r => r.Bus.OperatorId == operatorId)
            .OrderByDescending(r => r.Bookings.Count)
            .Take(5)
            .Select(r => new RouteStatsDto
            {
                RouteId = r.Id,
                Origin = r.Origin,
                Destination = r.Destination,
                BookingCount = r.Bookings.Count,
                Revenue = r.Bookings
                    .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Refunded)
                    .Sum(b => b.TotalAmount)
            })
            .ToListAsync();

        return new OperatorDashboardDto
        {
            TotalBuses = buses,
            TotalRoutes = routes,
            TotalBookings = bookings.Count,
            TotalRevenue = revenue,
            PendingRefunds = bookings.Count(b => b.Status == BookingStatus.Cancelled),
            RecentBookings = bookings.Take(10).Select(BookingService.MapToDto).ToList(),
            PopularRoutes = popularRoutes
        };
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync()
    {
        var users = await _db.Users.CountAsync(u => u.Role == UserRole.Passenger);
        var operators = await _db.Users.CountAsync(u => u.Role == UserRole.Operator);
        var routes = await _db.Routes.CountAsync();

        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var revenue = bookings
            .Where(b => b.Status == BookingStatus.Confirmed)
            .Sum(b => b.TotalAmount);

        return new AdminDashboardDto
        {
            TotalUsers = users,
            TotalOperators = operators,
            TotalRoutes = routes,
            TotalBookings = bookings.Count,
            TotalRevenue = revenue,
            RecentBookings = bookings.Take(10).Select(BookingService.MapToDto).ToList()
        };
    }
}
