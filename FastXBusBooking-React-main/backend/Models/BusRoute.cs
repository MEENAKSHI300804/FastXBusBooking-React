using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FastX.Api.Models;

public enum RouteStatus
{
    Active,
    Cancelled,
    Completed
}

public class BusRoute
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int BusId { get; set; }
    [ForeignKey("BusId")]
    public Bus Bus { get; set; } = null!;

    [Required, MaxLength(100)]
    public string Origin { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Destination { get; set; } = string.Empty;

    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Fare { get; set; }

    public RouteStatus Status { get; set; } = RouteStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
