using FastX.Api.Data;
using FastX.Api.DTOs;
using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Services;

public class BookingService
{
    private readonly FastXDbContext _db;
    private readonly ILogger<BookingService> _logger;

    public BookingService(FastXDbContext db, ILogger<BookingService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<BookingDto>> ListForUserAsync(int userId)
    {
        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
    }

    public async Task<List<BookingDto>> ListForOperatorAsync(int operatorId)
    {
        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .Where(b => b.Route.Bus.OperatorId == operatorId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
    }

    public async Task<List<BookingDto>> ListAllAsync()
    {
        var bookings = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookings.Select(MapToDto).ToList();
    }

    public async Task<BookingDto?> GetAsync(int id, int? userId = null)
    {
        var booking = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null) return null;
        if (userId.HasValue && booking.UserId != userId.Value) return null;

        return MapToDto(booking);
    }

    public async Task<BookingDto> CreateAsync(BookingInputDto dto, int userId)
    {
        var route = await _db.Routes
            .Include(r => r.Bus)
            .FirstOrDefaultAsync(r => r.Id == dto.RouteId)
            ?? throw new InvalidOperationException("Route not found");

        if (route.Status != RouteStatus.Active)
            throw new InvalidOperationException("Route is not active");

        var seats = await _db.Seats
            .Where(s => dto.SeatIds.Contains(s.Id) && s.RouteId == dto.RouteId)
            .ToListAsync();

        if (seats.Count != dto.SeatIds.Count)
            throw new InvalidOperationException("One or more seats not found for this route");

        if (seats.Any(s => s.IsBooked))
            throw new InvalidOperationException("One or more selected seats are already booked");

        var totalAmount = route.Fare * seats.Count;
        var seatNumbers = seats.Select(s => s.SeatNumber).ToList();

        var booking = new Booking
        {
            UserId = userId,
            RouteId = dto.RouteId,
            SeatNumbers = string.Join(",", seatNumbers),
            TotalAmount = totalAmount,
            Status = BookingStatus.Confirmed
        };

        _db.Bookings.Add(booking);

        foreach (var seat in seats)
        {
            seat.IsBooked = true;
            _db.BookingSeats.Add(new BookingSeat { Booking = booking, SeatId = seat.Id });
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Booking created: {BookingId} for user {UserId}", booking.Id, userId);

        return (await GetAsync(booking.Id))!;
    }

    public async Task<BookingDto?> CancelAsync(int id, int userId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .Include(b => b.BookingSeats).ThenInclude(bs => bs.Seat)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null) return null;

        if (booking.Status != BookingStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed bookings can be cancelled");

        booking.Status = BookingStatus.Cancelled;

        foreach (var bs in booking.BookingSeats)
            bs.Seat.IsBooked = false;

        await _db.SaveChangesAsync();
        _logger.LogInformation("Booking cancelled: {BookingId}", id);
        return MapToDto(booking);
    }

    public async Task<BookingDto?> ProcessRefundAsync(int id, int operatorId)
    {
        var booking = await _db.Bookings
            .Include(b => b.Route).ThenInclude(r => r.Bus)
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id && b.Route.Bus.OperatorId == operatorId);

        if (booking == null) return null;

        if (booking.Status != BookingStatus.Cancelled)
            throw new InvalidOperationException("Only cancelled bookings can be refunded");

        booking.Status = BookingStatus.Refunded;
        await _db.SaveChangesAsync();
        _logger.LogInformation("Refund processed for booking: {BookingId}", id);
        return MapToDto(booking);
    }

    public static BookingDto MapToDto(Booking b) => new()
    {
        Id = b.Id,
        UserId = b.UserId,
        UserName = b.User?.Name,
        RouteId = b.RouteId,
        Origin = b.Route?.Origin,
        Destination = b.Route?.Destination,
        DepartureTime = b.Route?.DepartureTime,
        SeatNumbers = b.SeatNumbers.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
        TotalAmount = b.TotalAmount,
        Status = b.Status.ToString().ToLower(),
        CreatedAt = b.CreatedAt,
        BusName = b.Route?.Bus?.Name,
        BusNumber = b.Route?.Bus?.BusNumber
    };
}
