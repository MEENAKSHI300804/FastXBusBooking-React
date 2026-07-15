using FastX.Api.Data;
using FastX.Api.DTOs;
using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Services;

public class BusService
{
    private readonly FastXDbContext _db;
    private readonly ILogger<BusService> _logger;

    public BusService(FastXDbContext db, ILogger<BusService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<BusDto>> ListAsync(int? operatorId = null)
    {
        var query = _db.Buses.Include(b => b.Operator).AsQueryable();
        if (operatorId.HasValue)
            query = query.Where(b => b.OperatorId == operatorId.Value);

        return await query.Select(b => MapToDto(b)).ToListAsync();
    }

    public async Task<BusDto?> GetAsync(int id)
    {
        var bus = await _db.Buses.Include(b => b.Operator).FirstOrDefaultAsync(b => b.Id == id);
        return bus == null ? null : MapToDto(bus);
    }

    public async Task<BusDto> CreateAsync(BusInputDto dto, int operatorId)
    {
        var busType = ParseBusType(dto.BusType);
        var bus = new Bus
        {
            Name = dto.Name,
            BusNumber = dto.BusNumber,
            BusType = busType,
            TotalSeats = dto.TotalSeats,
            OperatorId = operatorId,
            HasWaterBottle = dto.Amenities?.WaterBottle ?? false,
            HasChargingPoint = dto.Amenities?.ChargingPoint ?? false,
            HasTv = dto.Amenities?.Tv ?? false,
            HasBlanket = dto.Amenities?.Blanket ?? false,
        };

        _db.Buses.Add(bus);
        await _db.SaveChangesAsync();
        _logger.LogInformation("Bus created: {Name} by operator {OperatorId}", bus.Name, operatorId);

        var created = await _db.Buses.Include(b => b.Operator).FirstAsync(b => b.Id == bus.Id);
        return MapToDto(created);
    }

    public async Task<BusDto?> UpdateAsync(int id, BusInputDto dto, int operatorId, bool isAdmin = false)
    {
        var bus = await _db.Buses.Include(b => b.Operator).FirstOrDefaultAsync(b => b.Id == id);
        if (bus == null) return null;
        if (!isAdmin && bus.OperatorId != operatorId) return null;

        bus.Name = dto.Name;
        bus.BusNumber = dto.BusNumber;
        bus.BusType = ParseBusType(dto.BusType);
        bus.TotalSeats = dto.TotalSeats;
        bus.HasWaterBottle = dto.Amenities?.WaterBottle ?? false;
        bus.HasChargingPoint = dto.Amenities?.ChargingPoint ?? false;
        bus.HasTv = dto.Amenities?.Tv ?? false;
        bus.HasBlanket = dto.Amenities?.Blanket ?? false;

        await _db.SaveChangesAsync();
        return MapToDto(bus);
    }

    public async Task<bool> DeleteAsync(int id, int operatorId, bool isAdmin = false)
    {
        var bus = await _db.Buses.FirstOrDefaultAsync(b => b.Id == id);
        if (bus == null) return false;
        if (!isAdmin && bus.OperatorId != operatorId) return false;

        _db.Buses.Remove(bus);
        await _db.SaveChangesAsync();
        return true;
    }

    private static BusType ParseBusType(string type) => type.ToLower() switch
    {
        "seater_ac" => BusType.SeaterAc,
        "seater_non_ac" => BusType.SeaterNonAc,
        "sleeper_ac" => BusType.SleeperAc,
        "sleeper_non_ac" => BusType.SleeperNonAc,
        _ => BusType.SeaterAc
    };

    public static BusDto MapToDto(Bus b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        BusNumber = b.BusNumber,
        BusType = BusTypeToString(b.BusType),
        TotalSeats = b.TotalSeats,
        OperatorId = b.OperatorId,
        OperatorName = b.Operator?.Name,
        Amenities = new AmenitiesDto
        {
            WaterBottle = b.HasWaterBottle,
            ChargingPoint = b.HasChargingPoint,
            Tv = b.HasTv,
            Blanket = b.HasBlanket,
        }
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
