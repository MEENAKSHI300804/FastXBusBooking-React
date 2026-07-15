import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useRegisterOperator } from "@workspace/api-client-react";
import { operatorRegisterSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useErrorHandler } from "@/lib/error";
import { useTitle } from "@/hooks/use-title";

type OperatorRegisterFormValues = z.infer<typeof operatorRegisterSchema>;

export default function OperatorRegisterPage() {
  useTitle("Operator Registration");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const handleError = useErrorHandler();

  const registerOperator = useRegisterOperator();

  const form = useForm<OperatorRegisterFormValues>({
    resolver: zodResolver(operatorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      companyName: "",
      gender: "male", // default for form
    },
  });

  const onSubmit = (data: OperatorRegisterFormValues) => {
    registerOperator.mutate({ data }, {
      onSuccess: (response) => {
        login(response.token, response.user);
        setLocation('/operator/dashboard');
      },
      onError: (err) => handleError(err, "Registration Failed")
    });
  };

  const isPending = registerOperator.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">FastX Operator</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Partner with us</CardTitle>
            <CardDescription className="text-center">Register your bus operating company</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Express Travels" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@expresstravels.com" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="10-digit number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isPending}>
                  {isPending ? "Creating account..." : "Register Company"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col border-t p-6">
            <div className="text-sm text-center text-muted-foreground">
              Already a partner?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}