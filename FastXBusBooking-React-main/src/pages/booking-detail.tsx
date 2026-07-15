import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { useTitle } from "@/hooks/use-title";
import { useRoute } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingDetailPage() {
  const [, params] = useRoute("/bookings/:id");
  const bookingId = parseInt(params?.id || "0", 10);
  useTitle(`E-Ticket #${bookingId}`);

  const { data: booking, isLoading } = useGetBooking(bookingId, {
    query: {
      enabled: !!bookingId,
      queryKey: getGetBookingQueryKey(bookingId)
    }
  });

  if (isLoading) {
    return (
      <PassengerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PassengerLayout>
    );
  }

  if (!booking) return null;

  return (
    <ProtectedRoute allowedRoles={['passenger', 'operator', 'admin']}>
      <PassengerLayout>
        <div className="bg-slate-100 min-h-screen py-10">
          <div className="container mx-auto px-4">
            
            <div className="max-w-2xl mx-auto flex justify-end gap-2 mb-4">
              <Button variant="outline" className="bg-white gap-2" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>

            <Card className="max-w-2xl mx-auto shadow-lg border-0 overflow-hidden print:shadow-none print:border">
              {/* Ticket Header */}
              <div className="bg-primary text-primary-foreground p-6 sm:p-8 flex justify-between items-center relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10">
                  <QrCode className="h-48 w-48" />
                </div>
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-wider font-semibold text-primary-foreground/70 mb-1">E-Ticket</div>
                  <h1 className="text-2xl font-bold tracking-tight">FastX Boarding Pass</h1>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-xs uppercase tracking-wider font-semibold text-primary-foreground/70 mb-1">Booking ID</div>
                  <div className="font-mono font-bold text-lg">#{booking.id}</div>
                </div>
              </div>

              {/* Status Banner */}
              {booking.status !== 'confirmed' && (
                <div className={`p-3 text-center font-semibold text-sm ${
                  booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-800'
                }`}>
                  THIS BOOKING IS {booking.status.toUpperCase()}
                </div>
              )}

              <CardContent className="p-0">
                {/* Route Info */}
                <div className="p-6 sm:p-8 flex items-center justify-between border-b">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">From</div>
                    <div className="text-2xl font-bold">{booking.origin}</div>
                  </div>
                  
                  <div className="px-4 flex flex-col items-center flex-1">
                    <div className="w-full flex items-center">
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                      <Separator className="flex-1 border-t-2 border-dashed border-slate-300" />
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">To</div>
                    <div className="text-2xl font-bold">{booking.destination}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 sm:p-8 bg-slate-50 border-b">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Date & Time</div>
                    <div className="font-semibold">{formatDateTime(booking.departureTime!)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Bus Info</div>
                    <div className="font-semibold">{booking.busName}</div>
                    <div className="text-xs text-muted-foreground">{booking.busNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Seats</div>
                    <div className="font-semibold text-primary">{booking.seatNumbers.join(", ")}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Passenger</div>
                    <div className="font-semibold">{booking.userName}</div>
                  </div>
                </div>

                {/* Footer / QR */}
                <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Total Fare Paid</span>
                      <span className="font-bold text-xl">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Booking Date</span>
                      <span className="font-medium text-sm">{formatDateTime(booking.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={booking.status === 'confirmed' ? 'success' : 'destructive'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="shrink-0 bg-white p-2 border rounded-lg">
                    {/* Fake QR code visualization */}
                    <QrCode className="h-24 w-24 text-slate-800" strokeWidth={1} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="max-w-2xl mx-auto mt-6 text-center text-sm text-muted-foreground">
              Please present this e-ticket along with a valid Government ID at the time of boarding.
            </div>

          </div>
        </div>
      </PassengerLayout>
    </ProtectedRoute>
  );
}