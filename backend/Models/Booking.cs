using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FastX.Api.Models;

public enum BookingStatus
{
    Confirmed,
    Cancelled,
    Refunded
}

public class Booking
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public int RouteId { get; set; }
    [ForeignKey("RouteId")]
    public BusRoute Route { get; set; } = null!;

    // Comma-separated seat numbers for simplicity
    [Required]
    public string SeatNumbers { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingSeat> BookingSeats { get; set; } = new List<BookingSeat>();
}

public class BookingSeat
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int BookingId { get; set; }
    [ForeignKey("BookingId")]
    public Booking Booking { get; set; } = null!;

    public int SeatId { get; set; }
    [ForeignKey("SeatId")]
    public Seat Seat { get; set; } = null!;
}
