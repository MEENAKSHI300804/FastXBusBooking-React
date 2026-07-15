import { useToast } from "@/hooks/use-toast";

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.data?.message) return error.data.message;
  if (error?.data?.error) return error.data.error;
  return "An unexpected error occurred. Please try again.";
}

export function useErrorHandler() {
  const { toast } = useToast();

  return (error: any, title = "Error") => {
    toast({
      title,
      description: getErrorMessage(error),
      variant: "destructive",
    });
  };
}