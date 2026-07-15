import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminListOperators, getAdminListOperatorsQueryKey, useAdminDeleteOperator } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog, Trash2, Building } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/formatters";

export default function AdminOperatorsPage() {
  useTitle("Manage Operators");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: operators, isLoading } = useAdminListOperators({
    query: { queryKey: getAdminListOperatorsQueryKey() }
  });

  const deleteOperator = useAdminDeleteOperator();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this operator? All their buses and routes will also be removed.")) {
      deleteOperator.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Operator deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getAdminListOperatorsQueryKey() });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bus Operators</h2>
            <p className="text-muted-foreground">Manage partner bus operating companies.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !operators || operators.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <UserCog className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No operators registered.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {operator.companyName}
                        </div>
                      </TableCell>
                      <TableCell>{operator.name}</TableCell>
                      <TableCell>{operator.email}</TableCell>
                      <TableCell>{operator.phone}</TableCell>
                      <TableCell>{operator.createdAt ? formatDateTime(operator.createdAt) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(operator.id)} disabled={deleteOperator.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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