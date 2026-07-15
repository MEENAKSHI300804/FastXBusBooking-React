import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListBookings, getListBookingsQueryKey, useCancelBooking } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { useTitle } from "@/hooks/use-title";
import { MapPin, Ticket, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function BookingsPage() {
  useTitle("My Bookings");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: bookings, isLoading } = useListBookings({
    query: {
      queryKey: getListBookingsQueryKey()
    }
  });

  const cancelBooking = useCancelBooking();

  const handleCancel = (id: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Booking cancelled successfully" });
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        },
        onError: (err: any) => {
          toast({ 
            title: "Failed to cancel booking", 
            description: err?.message || "An error occurred",
            variant: "destructive"
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <PassengerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PassengerLayout>
    );
  }

  const upcomingBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.departureTime!) > new Date()) || [];
  const pastBookings = bookings?.filter(b => b.status === 'confirmed' && new Date(b.departureTime!) <= new Date()) || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled' || b.status === 'refunded') || [];

  const BookingCard = ({ booking, isUpcoming }: { booking: any, isUpcoming: boolean }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={
                booking.status === 'confirmed' ? 'success' :
                booking.status === 'cancelled' ? 'destructive' : 'secondary'
              }>
                {booking.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">ID: #{booking.id}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{formatCurrency(booking.totalAmount)}</div>
              <div className="text-xs text-muted-foreground">{booking.seatNumbers.length} seats</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div className="font-semibold text-lg">{booking.origin} <span className="text-muted-foreground font-normal mx-2">to</span> {booking.destination}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Departure</div>
              <div className="font-medium">{formatDateTime(booking.departureTime)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Seats</div>
              <div className="font-medium">{booking.seatNumbers.join(", ")}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 md:w-48 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border gap-3">
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/bookings/${booking.id}`}>View Ticket</Link>
          </Button>
          {isUpcoming && booking.status === 'confirmed' && (
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => handleCancel(booking.id)}
              disabled={cancelBooking.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <ProtectedRoute allowedRoles={['passenger', 'operator', 'admin']}>
      <PassengerLayout>
        <div className="bg-primary/5 py-8 border-b">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground mt-2">Manage your upcoming journeys and view past trips.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-10">
            
            {bookings?.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border shadow-sm">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">No bookings yet</h2>
                <p className="text-muted-foreground mb-6">Looks like you haven't booked any journeys.</p>
                <Button asChild size="lg">
                  <Link href="/">Book a Ticket</Link>
                </Button>
              </div>
            ) : (
              <>
                {upcomingBookings.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      Upcoming Journeys
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">{upcomingBookings.length}</Badge>
                    </h2>
                    {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} isUpcoming={true} />)}
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                      Past Journeys
                    </h2>
                    {pastBookings.map(b => <BookingCard key={b.id} booking={b} isUpcoming={false} />)}
                  </div>
                )}

                {cancelledBookings.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                      Cancelled & Refunded
                    </h2>
                    {cancelledBookings.map(b => <BookingCard key={b.id} booking={b} isUpcoming={false} />)}
                  </div>
                )}
              </>
            )}
            
          </div>
        </div>
      </PassengerLayout>
    </ProtectedRoute>
  );
}