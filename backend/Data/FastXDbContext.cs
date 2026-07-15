using FastX.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FastX.Api.Data;

public class FastXDbContext : DbContext
{
    public FastXDbContext(DbContextOptions<FastXDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Bus> Buses { get; set; }
    public DbSet<BusRoute> Routes { get; set; }
    public DbSet<Seat> Seats { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingSeat> BookingSeats { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        // Bus
        modelBuilder.Entity<Bus>(e =>
        {
            e.Property(b => b.BusType).HasConversion<string>();
            e.HasOne(b => b.Operator)
             .WithMany(u => u.Buses)
             .HasForeignKey(b => b.OperatorId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // BusRoute
        modelBuilder.Entity<BusRoute>(e =>
        {
            e.Property(r => r.Status).HasConversion<string>();
            e.HasOne(r => r.Bus)
             .WithMany(b => b.Routes)
             .HasForeignKey(r => r.BusId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seat
        modelBuilder.Entity<Seat>(e =>
        {
            e.HasOne(s => s.Route)
             .WithMany(r => r.Seats)
             .HasForeignKey(s => s.RouteId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking
        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Status).HasConversion<string>();
            e.HasOne(b => b.User)
             .WithMany(u => u.Bookings)
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Route)
             .WithMany(r => r.Bookings)
             .HasForeignKey(b => b.RouteId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // BookingSeat
        modelBuilder.Entity<BookingSeat>(e =>
        {
            e.HasOne(bs => bs.Booking)
             .WithMany(b => b.BookingSeats)
             .HasForeignKey(bs => bs.BookingId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(bs => bs.Seat)
             .WithMany()
             .HasForeignKey(bs => bs.SeatId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
