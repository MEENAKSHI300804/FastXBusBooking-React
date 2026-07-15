import React, { useState } from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OperatorLayout } from "@/components/layout/operator-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListRoutes, getListRoutesQueryKey, useCreateRoute, useUpdateRoute, useDeleteRoute, RouteDetail, useListBuses, getListBusesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routeSchema } from "@/lib/validations";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

type RouteFormValues = z.infer<typeof routeSchema>;

export default function OperatorRoutesPage() {
  useTitle("Manage Routes");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteDetail | null>(null);

  const { data: routes, isLoading: isLoadingRoutes } = useListRoutes({
    query: { queryKey: getListRoutesQueryKey() }
  });

  const { data: buses } = useListBuses({
    query: { queryKey: getListBusesQueryKey() }
  });

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      busId: 0,
      origin: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      fare: 0
    }
  });

  const openAddDialog = () => {
    setEditingRoute(null);
    form.reset({
      busId: buses && buses.length > 0 ? buses[0].id : 0,
      origin: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      fare: 0
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (route: RouteDetail) => {
    setEditingRoute(route);
    form.reset({
      busId: route.busId || 0,
      origin: route.origin,
      destination: route.destination,
      departureTime: new Date(route.departureTime).toISOString().slice(0, 16), // Format for datetime-local
      arrivalTime: new Date(route.arrivalTime).toISOString().slice(0, 16),
      fare: route.fare
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: RouteFormValues) => {
    // Ensure datetime strings are proper ISO strings
    const payload = {
      ...data,
      departureTime: new Date(data.departureTime).toISOString(),
      arrivalTime: new Date(data.arrivalTime).toISOString()
    };

    if (editingRoute) {
      updateRoute.mutate({ id: editingRoute.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Route updated successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListRoutesQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createRoute.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Route added successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListRoutesQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this route?")) {
      deleteRoute.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Route deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListRoutesQueryKey() });
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
            <h2 className="text-2xl font-bold tracking-tight">Route Management</h2>
            <p className="text-muted-foreground">Schedule journeys and set fares.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" /> Add Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRoute ? 'Edit Route' : 'Schedule New Route'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="busId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Bus</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString() || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Choose a bus" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {buses?.map(bus => (
                            <SelectItem key={bus.id} value={bus.id.toString()}>{bus.name} ({bus.busNumber})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="origin" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin City</FormLabel>
                        <FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination City</FormLabel>
                        <FormControl><Input placeholder="e.g. Pune" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="departureTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departure Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="arrivalTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="fare" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fare per seat (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createRoute.isPending || updateRoute.isPending}>
                      {createRoute.isPending || updateRoute.isPending ? "Saving..." : "Save Route"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoadingRoutes ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !routes || routes.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No routes scheduled yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Bus</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Seats Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.origin} → {route.destination}</TableCell>
                      <TableCell>{route.busName}</TableCell>
                      <TableCell>{formatDateTime(route.departureTime)}</TableCell>
                      <TableCell>{formatCurrency(route.fare)}</TableCell>
                      <TableCell>{route.availableSeats} / {route.totalSeats}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(route)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(route.id)}><Trash2 className="h-4 w-4" /></Button>
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