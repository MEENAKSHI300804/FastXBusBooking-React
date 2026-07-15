import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['passenger', 'operator', 'admin'] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && !allowedRoles.includes(user.role)) {
      if (user.role === 'admin') setLocation("/admin/dashboard");
      else if (user.role === 'operator') setLocation("/operator/dashboard");
      else setLocation("/");
    }
  }, [user, isLoading, setLocation, allowedRoles]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}