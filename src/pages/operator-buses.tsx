import React, { useState } from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { OperatorLayout } from "@/components/layout/operator-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListBuses, getListBusesQueryKey, useCreateBus, useUpdateBus, useDeleteBus, Bus } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BusFront, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { busSchema } from "@/lib/validations";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { getBusTypeDisplay } from "@/lib/formatters";

type BusFormValues = z.infer<typeof busSchema>;

export default function OperatorBusesPage() {
  useTitle("Manage Buses");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  const { data: buses, isLoading } = useListBuses({
    query: {
      queryKey: getListBusesQueryKey()
    }
  });

  const createBus = useCreateBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();

  const form = useForm<BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      name: "",
      busNumber: "",
      busType: "seater_ac",
      totalSeats: 40,
      amenities: {
        waterBottle: false,
        chargingPoint: false,
        tv: false,
        blanket: false
      }
    }
  });

  const openAddDialog = () => {
    setEditingBus(null);
    form.reset({
      name: "",
      busNumber: "",
      busType: "seater_ac",
      totalSeats: 40,
      amenities: { waterBottle: false, chargingPoint: false, tv: false, blanket: false }
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (bus: Bus) => {
    setEditingBus(bus);
    form.reset({
      name: bus.name,
      busNumber: bus.busNumber,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities || { waterBottle: false, chargingPoint: false, tv: false, blanket: false }
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: BusFormValues) => {
    if (editingBus) {
      updateBus.mutate({ id: editingBus.id, data }, {
        onSuccess: () => {
          toast({ title: "Bus updated successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListBusesQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createBus.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Bus added successfully" });
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: getListBusesQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this bus?")) {
      deleteBus.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Bus deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getListBusesQueryKey() });
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
            <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
            <p className="text-muted-foreground">Manage your buses and their amenities.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" /> Add Bus
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus Name/Model</FormLabel>
                      <FormControl><Input placeholder="Volvo B11R" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="busNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl><Input placeholder="MH 12 AB 1234" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="busType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bus Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="seater_ac">A/C Seater</SelectItem>
                            <SelectItem value="seater_non_ac">Non A/C Seater</SelectItem>
                            <SelectItem value="sleeper_ac">A/C Sleeper</SelectItem>
                            <SelectItem value="sleeper_non_ac">Non A/C Sleeper</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="totalSeats" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Seats</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <div className="pt-2">
                    <FormLabel className="mb-3 block">Amenities</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="amenities.waterBottle" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-normal">Water Bottle</FormLabel>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="amenities.chargingPoint" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-normal">Charging Point</FormLabel>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="amenities.tv" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-normal">TV/Entertainment</FormLabel>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="amenities.blanket" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel className="font-normal">Blanket</FormLabel>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createBus.isPending || updateBus.isPending}>
                      {createBus.isPending || updateBus.isPending ? "Saving..." : "Save Bus"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !buses || buses.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <BusFront className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No buses added yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bus Name</TableHead>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell className="font-medium">{bus.name}</TableCell>
                      <TableCell className="font-mono text-sm">{bus.busNumber}</TableCell>
                      <TableCell>{getBusTypeDisplay(bus.busType)}</TableCell>
                      <TableCell>{bus.totalSeats} seats</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(bus)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(bus.id)}><Trash2 className="h-4 w-4" /></Button>
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