import React, { useState } from 'react';
import { useRoute } from "wouter";
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetRoute, getGetRouteQueryKey, useGetRouteSeats, getGetRouteSeatsQueryKey, useCreateBooking } from "@workspace/api-client-react";
import { formatCurrency, formatTime, calculateDuration } from "@/lib/formatters";
import { useTitle } from "@/hooks/use-title";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export default function SeatSelectionPage() {
  useTitle("Select Seats");
  const [, params] = useRoute("/routes/:id/seats");
  const routeId = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  const { data: route, isLoading: isLoadingRoute } = useGetRoute(routeId, {
    query: {
      enabled: !!routeId,
      queryKey: getGetRouteQueryKey(routeId)
    }
  });

  const { data: seats, isLoading: isLoadingSeats } = useGetRouteSeats(routeId, {
    query: {
      enabled: !!routeId,
      queryKey: getGetRouteSeatsQueryKey(routeId)
    }
  });

  const createBooking = useCreateBooking();

  const toggleSeat = (seatId: number, isBooked: boolean) => {
    if (isBooked) return;
    
    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId]
    );
  };

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book seats.",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }

    if (selectedSeatIds.length === 0) return;

    createBooking.mutate({
      data: {
        routeId: routeId,
        seatIds: selectedSeatIds
      }
    }, {
      onSuccess: (booking) => {
        toast({
          title: "Booking Successful",
          description: "Your seats have been booked."
        });
        setLocation(`/bookings/${booking.id}`);
      },
      onError: (err: any) => {
        toast({
          title: "Booking Failed",
          description: err?.message || "Could not complete booking.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoadingRoute || isLoadingSeats) {
    return (
      <PassengerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PassengerLayout>
    );
  }

  if (!route || !seats) {
    return (
      <PassengerLayout>
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold">Route not found</h2>
          <Button className="mt-4" onClick={() => setLocation("/")}>Back to Home</Button>
        </div>
      </PassengerLayout>
    );
  }

  const selectedSeatsData = seats.filter(s => selectedSeatIds.includes(s.id));
  const totalAmount = selectedSeatIds.length * route.fare;

  // Group seats by row
  const seatsByRow: Record<number, typeof seats> = {};
  seats.forEach(seat => {
    const row = seat.seatRow || 0;
    if (!seatsByRow[row]) seatsByRow[row] = [];
    seatsByRow[row].push(seat);
  });
  
  // Sort rows and columns
  const sortedRows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);
  sortedRows.forEach(row => {
    seatsByRow[row].sort((a, b) => (a.seatCol || '').localeCompare(b.seatCol || ''));
  });

  return (
    <PassengerLayout>
      <div className="bg-slate-900 text-white pt-8 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{route.origin} to {route.destination}</h1>
              <p className="text-slate-300 mt-1">
                {route.operatorName} • {route.busName} • {new Date(route.departureTime).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">
              Departure at {formatTime(route.departureTime)} • Duration {calculateDuration(route.departureTime, route.arrivalTime)}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-8 relative z-10 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 shadow-lg border-0">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Select Seats</CardTitle>
              <CardDescription>Click on available seats to select them</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-300 rounded bg-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary bg-primary text-primary-foreground flex items-center justify-center rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-200 border border-slate-300 rounded"></div>
                  <span>Booked</span>
                </div>
              </div>

              <div className="bg-white border rounded-3xl p-8 max-w-sm mx-auto shadow-inner">
                {/* Steering wheel icon placeholder */}
                <div className="flex justify-end mb-8 border-b-2 border-dashed pb-4">
                  <div className="w-8 h-8 rounded-full border-4 border-slate-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedRows.map(rowNum => {
                    const rowSeats = seatsByRow[rowNum];
                    // Group into left and right sides (assuming col A,B and C,D or similar)
                    const leftSeats = rowSeats.filter(s => s.seatCol && s.seatCol < 'C');
                    const rightSeats = rowSeats.filter(s => s.seatCol && s.seatCol >= 'C');

                    return (
                      <div key={`row-${rowNum}`} className="flex justify-between items-center gap-8">
                        <div className="flex gap-2">
                          {leftSeats.map(seat => (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => toggleSeat(seat.id, seat.isBooked)}
                              className={`
                                w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center text-xs font-semibold transition-all
                                ${seat.isBooked 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                                  : selectedSeatIds.includes(seat.id)
                                    ? 'bg-primary text-primary-foreground border-2 border-primary shadow-md scale-105'
                                    : 'bg-white border-2 border-slate-300 text-slate-600 hover:border-primary cursor-pointer hover:shadow-sm'
                                }
                              `}
                            >
                              {seat.seatNumber}
                            </button>
                          ))}
                        </div>
                        
                        {/* Aisle */}
                        <div className="w-8"></div>
                        
                        <div className="flex gap-2">
                          {rightSeats.map(seat => (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => toggleSeat(seat.id, seat.isBooked)}
                              className={`
                                w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center text-xs font-semibold transition-all
                                ${seat.isBooked 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                                  : selectedSeatIds.includes(seat.id)
                                    ? 'bg-primary text-primary-foreground border-2 border-primary shadow-md scale-105'
                                    : 'bg-white border-2 border-slate-300 text-slate-600 hover:border-primary cursor-pointer hover:shadow-sm'
                                }
                              `}
                            >
                              {seat.seatNumber}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-1 space-y-6">
            <Card className="sticky top-20 shadow-lg border-0">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Journey Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fare per seat</span>
                    <span className="font-medium">{formatCurrency(route.fare)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <span className="text-muted-foreground block mb-2">Selected Seats ({selectedSeatIds.length})</span>
                    {selectedSeatIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeatsData.map(seat => (
                          <span key={seat.id} className="bg-primary/10 text-primary px-2 py-1 rounded font-medium text-sm">
                            {seat.seatNumber}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm font-medium">None selected</span>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-8 h-12 text-base font-bold shadow-md" 
                  disabled={selectedSeatIds.length === 0 || createBooking.isPending}
                  onClick={handleBooking}
                >
                  {createBooking.isPending ? "Processing..." : "Continue to Book"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PassengerLayout>
  );
}