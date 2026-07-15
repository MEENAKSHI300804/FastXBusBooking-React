using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FastX.Api.Models;

public class Seat
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int RouteId { get; set; }
    [ForeignKey("RouteId")]
    public BusRoute Route { get; set; } = null!;

    [Required, MaxLength(10)]
    public string SeatNumber { get; set; } = string.Empty;

    public int SeatRow { get; set; }

    [MaxLength(5)]
    public string SeatCol { get; set; } = string.Empty;

    public bool IsBooked { get; set; } = false;
}
