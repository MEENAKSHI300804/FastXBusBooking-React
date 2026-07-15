import React from 'react';
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PassengerLayout } from "@/components/layout/passenger-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/lib/validations";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { useUpdateCurrentUser, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/hooks/use-title";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
  useTitle("My Profile");
  const { user, login, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey()
    }
  });

  const updateUser = useUpdateCurrentUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    values: {
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      address: profileData?.address || "",
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateUser.mutate({ data }, {
      onSuccess: (updatedProfile) => {
        toast({ title: "Profile updated successfully" });
        if (token) {
          login(token, updatedProfile);
        }
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: (err: any) => {
        toast({ 
          title: "Failed to update profile", 
          description: err?.message || "An error occurred",
          variant: "destructive"
        });
      }
    });
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

  return (
    <ProtectedRoute allowedRoles={['passenger', 'operator', 'admin']}>
      <PassengerLayout>
        <div className="bg-primary/5 py-8 border-b mb-8">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and preferences.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 pb-16">
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8">
            
            <div className="md:col-span-1">
              <Card className="border-0 shadow-sm bg-slate-50">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <User className="h-10 w-10" />
                  </div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                  <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 uppercase tracking-wider">
                    {user?.role}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your contact details and address</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <FormLabel className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Email Address (Cannot be changed)</FormLabel>
                          <Input value={user?.email} disabled className="bg-slate-50" />
                        </div>

                        {user?.role === 'operator' && user.companyName && (
                          <div className="grid gap-2">
                            <FormLabel className="text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> Company Name</FormLabel>
                            <Input value={user.companyName} disabled className="bg-slate-50" />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter your full address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit" disabled={updateUser.isPending} className="w-full md:w-auto">
                        {updateUser.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PassengerLayout>
    </ProtectedRoute>
  );
}