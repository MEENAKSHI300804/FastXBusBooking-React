import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OperatorLayout } from "@/components/layout/operator-layout";
import { useGetOperatorDashboard, getGetOperatorDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Bus, MapPin, Ticket, IndianRupee } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTitle } from "@/hooks/use-title";
import { formatDateTime } from "@/lib/formatters";

export default function OperatorDashboardPage() {
  useTitle("Operator Dashboard");
  const { data: dashboard, isLoading } = useGetOperatorDashboard({
    query: {
      queryKey: getGetOperatorDashboardQueryKey()
    }
  });

  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </OperatorLayout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['operator']}>
      <OperatorLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Overview of your operations</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboard?.totalRevenue || 0)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.totalBookings || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.totalRoutes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboard?.totalBuses || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentBookings && dashboard.recentBookings.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Passenger</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.recentBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.userName}</TableCell>
                            <TableCell>{booking.origin} - {booking.destination}</TableCell>
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent bookings found.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.popularRoutes && dashboard.popularRoutes.length > 0 ? (
                    dashboard.popularRoutes.map(route => (
                      <div key={route.routeId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{route.origin} to {route.destination}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{route.bookingCount} bookings</span>
                          <span className="font-medium text-primary">{formatCurrency(route.revenue || 0)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Not enough data yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </OperatorLayout>
    </ProtectedRoute>
  );
}