import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminListUsers, getAdminListUsersQueryKey, useAdminDeleteUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  useTitle("Manage Users");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() }
  });

  const deleteUser = useAdminDeleteUser();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "User deleted successfully" });
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
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
            <h2 className="text-2xl font-bold tracking-tight">Passenger Management</h2>
            <p className="text-muted-foreground">View and manage passenger accounts.</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : !users || users.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No users registered.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.createdAt ? formatDateTime(user.createdAt) : '-'}</TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'admin' && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)} disabled={deleteUser.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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