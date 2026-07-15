import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { useLoginUser, useLoginOperator } from "@workspace/api-client-react";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useErrorHandler } from "@/lib/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, User } from "lucide-react";
import { useTitle } from "@/hooks/use-title";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  useTitle("Log In");
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const handleError = useErrorHandler();
  const [activeTab, setActiveTab] = React.useState<"passenger" | "operator">("passenger");

  const loginUser = useLoginUser();
  const loginOperator = useLoginOperator();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    if (activeTab === "passenger") {
      loginUser.mutate({ data }, {
        onSuccess: (response) => {
          login(response.token, response.user);
          if (response.user.role === 'admin') setLocation('/admin/dashboard');
          else setLocation('/');
        },
        onError: (err) => handleError(err, "Login Failed")
      });
    } else {
      loginOperator.mutate({ data }, {
        onSuccess: (response) => {
          login(response.token, response.user);
          setLocation('/operator/dashboard');
        },
        onError: (err) => handleError(err, "Login Failed")
      });
    }
  };

  const isPending = loginUser.isPending || loginOperator.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">FastX</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Log in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="passenger" className="gap-2">
                  <User className="w-4 h-4" /> Passenger
                </TabsTrigger>
                <TabsTrigger value="operator" className="gap-2">
                  <Bus className="w-4 h-4" /> Operator
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isPending}>
                  {isPending ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col border-t p-6">
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              {activeTab === "passenger" ? (
                <Link href="/register" className="font-semibold text-primary hover:underline">Sign up</Link>
              ) : (
                <Link href="/operator/register" className="font-semibold text-primary hover:underline">Register as Operator</Link>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}