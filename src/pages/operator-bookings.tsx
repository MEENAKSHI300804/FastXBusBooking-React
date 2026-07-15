import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OperatorLayout } from "@/components/layout/operator-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useListOperatorBookings, getListOperatorBookingsQueryKey, useProcessRefund } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { useQueryClient } from "@tanstack/react-query";

export default function OperatorBookingsPage() {
  useTitle("Manage Bookings");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useListOperatorBookings({
    query: { queryKey: getListOperatorBookingsQueryKey() }
  });

  const processRefund = useProcessRefund();

  const handleRefund = (id: number) => {
    if (confirm("Process refund for this cancelled booking?")) {
      processRefund.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Refund processed successfully", variant: "default" });
          // We can use setQueryData here to update the local cache to avoid a full refetch
          queryClient.setQueryData(getListOperatorBookingsQueryKey(), (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((b: any) => b.id === id ? { ...b, status: 'refunded' } : b);
          });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['operator']}>
      <OperatorLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Booking History</h2>
            <p className="text-muted-foreground">View all passenger bookings for your routes.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Ticket className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No bookings received yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell>{booking.origin} → {booking.destination}</TableCell>
                      <TableCell>{formatDateTime(booking.departureTime || '')}</TableCell>
                      <TableCell>{booking.seatNumbers.join(", ")}</TableCell>
                      <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'success' :
                          booking.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'cancelled' && (
                          <Button size="sm" variant="outline" onClick={() => handleRefund(booking.id)} disabled={processRefund.isPending}>
                            Process Refund
                          </Button>
                        )}
                        {booking.status === 'refunded' && (
                          <span className="text-xs text-muted-foreground">Refunded</span>
                        )}
                        {booking.status === 'confirmed' && (
                           <span className="text-xs text-muted-foreground">Active</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </OperatorLayout>
    </ProtectedRoute>
  );
}