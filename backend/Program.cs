using System.Text;
using FastX.Api.Data;
using FastX.Api.Models;
using FastX.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Port from environment ──────────────────────────────────────────────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── Configuration ──────────────────────────────────────────────────────────
var connectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DATABASE_URL or ConnectionStrings:DefaultConnection must be set");

// Convert postgres:// URI to Npgsql connection string if needed
if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    var host = uri.Host;
    var dbPort = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    var password = Uri.UnescapeDataString(userInfo.Length > 1 ? userInfo[1] : "");
    // Use Prefer so SSL is attempted but not required (works for both local and cloud PG)
    connectionString = $"Host={host};Port={dbPort};Database={database};Username={userInfo[0]};Password={password};SSL Mode=Prefer;Trust Server Certificate=true";
}

var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT_SECRET or Jwt:Key must be configured");

// ── Services ───────────────────────────────────────────────────────────────
builder.Services.AddDbContext<FastXDbContext>(opts =>
    opts.UseNpgsql(connectionString));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<BusService>();
builder.Services.AddScoped<RouteService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddScoped<DashboardService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "fastx",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "fastx",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(p =>
        p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FastX API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Database Migration & Seed ──────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FastXDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        await db.Database.EnsureCreatedAsync();
        await SeedDataAsync(db, jwtKey, logger);
        await EnsureRoutesSeededAsync(db, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error during database initialization");
    }
}

// ── Middleware ─────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/api/swagger/v1/swagger.json", "FastX API v1"));
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// ── Seed Data ──────────────────────────────────────────────────────────────
static async Task SeedDataAsync(FastXDbContext db, string jwtKey, ILogger logger)
{
    if (await db.Users.AnyAsync()) return; // Already seeded

    logger.LogInformation("Seeding initial data...");

    // Admin user
    var admin = new User
    {
        Email = "admin@fastx.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
        Name = "FastX Admin",
        Role = UserRole.Admin,
        Phone = "9000000001"
    };

    // Bus operator
    var operator1 = new User
    {
        Email = "operator@speedlines.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operator@123"),
        Name = "Rajesh Kumar",
        Role = UserRole.Operator,
        Phone = "9000000002",
        CompanyName = "SpeedLines Express"
    };

    var operator2 = new User
    {
        Email = "operator@nationalbus.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operator@123"),
        Name = "Priya Sharma",
        Role = UserRole.Operator,
        Phone = "9000000003",
        CompanyName = "National Bus Service"
    };

    // Passengers
    var passenger1 = new User
    {
        Email = "alice@example.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Alice@123"),
        Name = "Alice Johnson",
        Gender = "female",
        Phone = "9000000004",
        Role = UserRole.Passenger
    };

    var passenger2 = new User
    {
        Email = "bob@example.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Bob@123"),
        Name = "Bob Wilson",
        Gender = "male",
        Phone = "9000000005",
        Role = UserRole.Passenger
    };

    db.Users.AddRange(admin, operator1, operator2, passenger1, passenger2);
    await db.SaveChangesAsync();

    // Buses
    var bus1 = new Bus
    {
        Name = "SpeedLines Volvo Gold",
        BusNumber = "SL-001",
        BusType = BusType.SleeperAc,
        TotalSeats = 40,
        OperatorId = operator1.Id,
        HasWaterBottle = true,
        HasChargingPoint = true,
        HasTv = true,
        HasBlanket = true
    };

    var bus2 = new Bus
    {
        Name = "SpeedLines Express",
        BusNumber = "SL-002",
        BusType = BusType.SeaterAc,
        TotalSeats = 44,
        OperatorId = operator1.Id,
        HasWaterBottle = true,
        HasChargingPoint = true,
        HasTv = false,
        HasBlanket = false
    };

    var bus3 = new Bus
    {
        Name = "National Super Deluxe",
        BusNumber = "NB-101",
        BusType = BusType.SleeperNonAc,
        TotalSeats = 36,
        OperatorId = operator2.Id,
        HasWaterBottle = false,
        HasChargingPoint = true,
        HasTv = false,
        HasBlanket = true
    };

    var bus4 = new Bus
    {
        Name = "National Budget Express",
        BusNumber = "NB-102",
        BusType = BusType.SeaterNonAc,
        TotalSeats = 52,
        OperatorId = operator2.Id,
        HasWaterBottle = false,
        HasChargingPoint = false,
        HasTv = false,
        HasBlanket = false
    };

    db.Buses.AddRange(bus1, bus2, bus3, bus4);
    await db.SaveChangesAsync();

    // Routes – next 7 days from now
    var now = DateTime.UtcNow.Date;
    var routes = new List<BusRoute>();

    var routeConfigs = new[]
    {
        (bus1, "Mumbai", "Pune",      0, 7, 30,  2, 30, 850m),
        (bus1, "Mumbai", "Goa",       1, 22, 0,  2, 14, 1800m),
        (bus2, "Pune",   "Mumbai",    0, 8, 0,   2, 30, 750m),
        (bus2, "Mumbai", "Nashik",    1, 6, 0,   2, 10, 650m),
        (bus3, "Delhi",  "Agra",      0, 6, 0,   2, 4,  550m),
        (bus3, "Delhi",  "Jaipur",    1, 7, 0,   2, 13, 950m),
        (bus4, "Chennai","Bangalore", 0, 21, 0,  2, 5,  700m),
        (bus4, "Bangalore","Chennai", 1, 22, 0,  2, 4,  700m),
    };

    foreach (var (bus, origin, dest, dayOffset, depH, depM, arrDays, arrH, fare) in routeConfigs)
    {
        for (var d = 0; d < 7; d++)
        {
            var dep = now.AddDays(dayOffset + d).AddHours(depH).AddMinutes(depM);
            var arr = now.AddDays(dayOffset + d + arrDays).AddHours(arrH);
            routes.Add(new BusRoute
            {
                Bus = bus,
                Origin = origin,
                Destination = dest,
                DepartureTime = dep,
                ArrivalTime = arr,
                Fare = fare,
                Status = RouteStatus.Active
            });
        }
    }

    db.Routes.AddRange(routes);
    await db.SaveChangesAsync();

    // Generate seats for every route
    foreach (var route in routes)
    {
        var seats = new List<Seat>();
        var totalSeats = route.Bus.TotalSeats;
        var cols = new[] { "A", "B", "C", "D" };
        int generated = 0, row = 1;

        while (generated < totalSeats)
        {
            foreach (var col in cols)
            {
                if (generated >= totalSeats) break;
                seats.Add(new Seat
                {
                    RouteId = route.Id,
                    SeatNumber = $"{row}{col}",
                    SeatRow = row,
                    SeatCol = col,
                    IsBooked = false
                });
                generated++;
            }
            row++;
        }
        db.Seats.AddRange(seats);
    }
    await db.SaveChangesAsync();

    // Sample bookings for passenger1
    var sampleRoute = routes.First();
    var seatsForRoute = await db.Seats.Where(s => s.RouteId == sampleRoute.Id).Take(2).ToListAsync();
    if (seatsForRoute.Count == 2)
    {
        var booking = new Booking
        {
            UserId = passenger1.Id,
            RouteId = sampleRoute.Id,
            SeatNumbers = string.Join(",", seatsForRoute.Select(s => s.SeatNumber)),
            TotalAmount = sampleRoute.Fare * 2,
            Status = BookingStatus.Confirmed
        };
        db.Bookings.Add(booking);
        foreach (var s in seatsForRoute)
        {
            s.IsBooked = true;
            db.BookingSeats.Add(new BookingSeat { Booking = booking, SeatId = s.Id });
        }
        await db.SaveChangesAsync();
    }

    logger.LogInformation("Seed complete. Admin: admin@fastx.com / Admin@123 | Operator: operator@speedlines.com / Operator@123 | Passenger: alice@example.com / Alice@123");
}

// ── Ensure routes exist for all city pairs (idempotent – runs every startup) ──
static async Task EnsureRoutesSeededAsync(FastXDbContext db, ILogger logger)
{
    var buses = await db.Buses.ToListAsync();
    if (buses.Count == 0) return; // users/buses not seeded yet

    var now = DateTime.UtcNow.Date;

    // bus index helpers
    Bus? ByNumber(string n) => buses.FirstOrDefault(b => b.BusNumber == n);

    // (busNumber, origin, destination, depHour, depMin, travelHours, fare)
    var pairs = new[]
    {
        ("SL-001", "Mumbai",    "Pune",       7, 30,  2.5,   850m),
        ("SL-001", "Mumbai",    "Goa",        22, 0,  16.0, 1800m),
        ("SL-001", "Mumbai",    "Chennai",    18, 0,  22.0, 2200m),
        ("SL-001", "Chennai",   "Mumbai",     17, 0,  22.0, 2200m),
        ("SL-001", "Hyderabad", "Bangalore",  21, 0,  11.0, 1200m),
        ("SL-001", "Bangalore", "Hyderabad",  22, 0,  11.0, 1200m),
        ("SL-002", "Pune",      "Mumbai",     8,  0,  2.5,   750m),
        ("SL-002", "Mumbai",    "Nashik",     6,  0,  4.0,   650m),
        ("SL-002", "Mumbai",    "Hyderabad",  20, 0,  14.0, 1400m),
        ("SL-002", "Hyderabad", "Chennai",    22, 0,   8.0,  900m),
        ("SL-002", "Chennai",   "Hyderabad",  21, 0,   8.0,  900m),
        ("NB-101", "Delhi",     "Agra",       6,  0,  4.0,   550m),
        ("NB-101", "Delhi",     "Jaipur",     7,  0,  6.0,   950m),
        ("NB-101", "Delhi",     "Lucknow",    20, 0,  9.0,  1050m),
        ("NB-101", "Delhi",     "Chandigarh", 6,  30, 4.0,   480m),
        ("NB-102", "Chennai",   "Bangalore",  21, 0,  8.0,   700m),
        ("NB-102", "Bangalore", "Chennai",    22, 0,  8.0,   700m),
        ("NB-102", "Bangalore", "Mysore",     7,  0,  3.0,   300m),
        ("NB-102", "Kolkata",   "Bhubaneswar",20, 0,  8.0,   800m),
    };

    int added = 0;
    foreach (var (busNo, origin, dest, depH, depM, travelHrs, fare) in pairs)
    {
        var bus = ByNumber(busNo);
        if (bus == null) continue;

        // Check if we already have a future route for this city-pair+bus
        var cutoff = now.AddDays(3);
        var hasRecent = await db.Routes.AnyAsync(r =>
            r.BusId == bus.Id &&
            r.Origin == origin &&
            r.Destination == dest &&
            r.DepartureTime > cutoff);

        if (hasRecent) continue; // already populated

        // Add 7 days of schedules starting today
        var newRoutes = new List<BusRoute>();
        for (var d = 0; d < 7; d++)
        {
            var dep = now.AddDays(d).AddHours(depH).AddMinutes(depM);
            var arr = dep.AddHours(travelHrs);
            newRoutes.Add(new BusRoute
            {
                BusId  = bus.Id,
                Origin = origin,
                Destination = dest,
                DepartureTime = dep,
                ArrivalTime   = arr,
                Fare   = fare,
                Status = RouteStatus.Active
            });
        }
        db.Routes.AddRange(newRoutes);
        await db.SaveChangesAsync();

        // Generate seats
        var cols = new[] { "A", "B", "C", "D" };
        foreach (var route in newRoutes)
        {
            var seats = new List<Seat>();
            int generated = 0, row = 1;
            while (generated < bus.TotalSeats)
            {
                foreach (var col in cols)
                {
                    if (generated >= bus.TotalSeats) break;
                    seats.Add(new Seat
                    {
                        RouteId    = route.Id,
                        SeatNumber = $"{row}{col}",
                        SeatRow    = row,
                        SeatCol    = col,
                        IsBooked   = false
                    });
                    generated++;
                }
                row++;
            }
            db.Seats.AddRange(seats);
        }
        await db.SaveChangesAsync();
        added += newRoutes.Count;
    }

    if (added > 0)
        logger.LogInformation("Route seed: added {Count} new route schedules.", added);
}
