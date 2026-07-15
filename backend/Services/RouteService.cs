using FastX.Api.Data;
using FastX.Api.DTOs;
using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Services;

public class RouteService
{
    private readonly FastXDbContext _db;
    private readonly ILogger<RouteService> _logger;

    public RouteService(FastXDbContext db, ILogger<RouteService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<string>> GetCitiesAsync()
    {
        var origins = await _db.Routes.Select(r => r.Origin).Distinct().ToListAsync();
        var dests = await _db.Routes.Select(r => r.Destination).Distinct().ToListAsync();
        return origins.Concat(dests).Distinct().OrderBy(c => c).ToList();
    }

    public async Task<List<RouteDetailDto>> SearchAsync(string origin, string destination, DateOnly date)
    {
        var startUtc = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endUtc = startUtc.AddDays(1);

        var routes = await _db.Routes
            .Include(r => r.Bus).ThenInclude(b => b.Operator)
            .Include(r => r.Seats)
            .Where(r =>
                r.Origin.ToLower().Contains(origin.ToLower()) &&
                r.Destination.ToLower().Contains(destination.ToLower()) &&
                r.DepartureTime >= startUtc &&
                r.DepartureTime < endUtc &&
                r.Status == RouteStatus.Active)
            .ToListAsync();

        return routes.Select(MapToDto).ToList();
    }

    public async Task<List<RouteDetailDto>> ListAsync(int? operatorId = null)
    {
        var query = _db.Routes
            .Include(r => r.Bus).ThenInclude(b => b.Operator)
            .Include(r => r.Seats)
            .AsQueryable();

        if (operatorId.HasValue)
            query = query.Where(r => r.Bus.OperatorId == operatorId.Value);

        return await query.Select(r => MapToDto(r)).ToListAsync();
    }

    public async Task<RouteDetailDto?> GetAsync(int id)
    {
        var route = await _db.Routes
            .Include(r => r.Bus).ThenInclude(b => b.Operator)
            .Include(r => r.Seats)
            .FirstOrDefaultAsync(r => r.Id == id);

        return route == null ? null : MapToDto(route);
    }

    public async Task<RouteDetailDto> CreateAsync(RouteInputDto dto, int operatorId)
    {
        var bus = await _db.Buses.FindAsync(dto.BusId)
            ?? throw new InvalidOperationException("Bus not found");

        if (bus.OperatorId != operatorId)
            throw new UnauthorizedAccessException("Bus does not belong to this operator");

        var route = new BusRoute
        {
            BusId = dto.BusId,
            Origin = dto.Origin,
            Destination = dto.Destination,
            DepartureTime = dto.DepartureTime.ToUniversalTime(),
            ArrivalTime = dto.ArrivalTime.ToUniversalTime(),
            Fare = dto.Fare,
            Status = RouteStatus.Active
        };

        _db.Routes.Add(route);
        await _db.SaveChangesAsync();

        // Auto-generate seats
        await GenerateSeatsAsync(route.Id, bus.TotalSeats);
        _logger.LogInformation("Route created: {Origin} → {Destination}", route.Origin, route.Destination);

        return (await GetAsync(route.Id))!;
    }

    public async Task<RouteDetailDto?> UpdateAsync(int id, RouteInputDto dto, int operatorId, bool isAdmin = false)
    {
        var route = await _db.Routes.Include(r => r.Bus).FirstOrDefaultAsync(r => r.Id == id);
        if (route == null) return null;
        if (!isAdmin && route.Bus.OperatorId != operatorId) return null;

        route.BusId = dto.BusId;
        route.Origin = dto.Origin;
        route.Destination = dto.Destination;
        route.DepartureTime = dto.DepartureTime.ToUniversalTime();
        route.ArrivalTime = dto.ArrivalTime.ToUniversalTime();
        route.Fare = dto.Fare;

        await _db.SaveChangesAsync();
        return await GetAsync(id);
    }

    public async Task<bool> DeleteAsync(int id, int operatorId, bool isAdmin = false)
    {
        var route = await _db.Routes.Include(r => r.Bus).FirstOrDefaultAsync(r => r.Id == id);
        if (route == null) return false;
        if (!isAdmin && route.Bus.OperatorId != operatorId) return false;

        _db.Routes.Remove(route);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<SeatDto>> GetSeatsAsync(int routeId)
    {
        var seats = await _db.Seats
            .Where(s => s.RouteId == routeId)
            .OrderBy(s => s.SeatRow).ThenBy(s => s.SeatCol)
            .ToListAsync();

        return seats.Select(s => new SeatDto
        {
            Id = s.Id,
            SeatNumber = s.SeatNumber,
            IsBooked = s.IsBooked,
            SeatRow = s.SeatRow,
            SeatCol = s.SeatCol
        }).ToList();
    }

    private async Task GenerateSeatsAsync(int routeId, int total)
    {
        var cols = new[] { "A", "B", "C", "D" };
        var seats = new List<Seat>();
        int generated = 0;
        int row = 1;

        while (generated < total)
        {
            foreach (var col in cols)
            {
                if (generated >= total) break;
                seats.Add(new Seat
                {
                    RouteId = routeId,
                    SeatNumber = $"{row}{col}",
                    SeatRow = row,
                    SeatCol = col,
                    IsBooked = false
                });
                generated++;
            }
            row++;
        }

        _db.Seats.AddRange(seats);
        await _db.SaveChangesAsync();
    }

    public static RouteDetailDto MapToDto(BusRoute r) => new()
    {
        Id = r.Id,
        BusId = r.BusId,
        BusName = r.Bus?.Name,
        BusNumber = r.Bus?.BusNumber,
        BusType = r.Bus == null ? null : BusTypeToString(r.Bus.BusType),
        Origin = r.Origin,
        Destination = r.Destination,
        DepartureTime = r.DepartureTime,
        ArrivalTime = r.ArrivalTime,
        Fare = r.Fare,
        AvailableSeats = r.Seats?.Count(s => !s.IsBooked) ?? 0,
        TotalSeats = r.Seats?.Count ?? 0,
        Status = r.Status.ToString().ToLower(),
        Amenities = r.Bus == null ? null : new AmenitiesDto
        {
            WaterBottle = r.Bus.HasWaterBottle,
            ChargingPoint = r.Bus.HasChargingPoint,
            Tv = r.Bus.HasTv,
            Blanket = r.Bus.HasBlanket,
        },
        OperatorName = r.Bus?.Operator?.Name
    };

    private static string BusTypeToString(BusType t) => t switch
    {
        BusType.SeaterAc => "seater_ac",
        BusType.SeaterNonAc => "seater_non_ac",
        BusType.SleeperAc => "sleeper_ac",
        BusType.SleeperNonAc => "sleeper_non_ac",
        _ => "seater_ac"
    };
}
