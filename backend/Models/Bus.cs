using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FastX.Api.Models;

public enum BusType
{
    SeaterAc,
    SeaterNonAc,
    SleeperAc,
    SleeperNonAc
}

public class Bus
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string BusNumber { get; set; } = string.Empty;

    public BusType BusType { get; set; } = BusType.SeaterAc;

    public int TotalSeats { get; set; }

    public int OperatorId { get; set; }
    [ForeignKey("OperatorId")]
    public User Operator { get; set; } = null!;

    // Amenities
    public bool HasWaterBottle { get; set; }
    public bool HasChargingPoint { get; set; }
    public bool HasTv { get; set; }
    public bool HasBlanket { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BusRoute> Routes { get; set; } = new List<BusRoute>();
}
