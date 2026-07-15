import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminListBookings, getAdminListBookingsQueryKey } from "@workspace/api-client-react";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

export default function AdminBookingsPage() {
  useTitle("All Bookings");

  const { data: bookings, isLoading } = useAdminListBookings({
    query: { queryKey: getAdminListBookingsQueryKey() }
  });

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Bookings</h2>
            <p className="text-muted-foreground">View all ticket bookings across the platform.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !bookings || bookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Ticket className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No bookings in the system.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell>{booking.origin} → {booking.destination}</TableCell>
                      <TableCell>{booking.busName}</TableCell>
                      <TableCell>{formatDateTime(booking.createdAt)}</TableCell>
                      <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'success' :
                          booking.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}