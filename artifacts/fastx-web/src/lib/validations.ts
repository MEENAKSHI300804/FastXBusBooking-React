import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.enum(["male", "female", "other"]),
});

export const operatorRegisterSchema = registerSchema.extend({
  companyName: z.string().min(2, "Company name is required"),
});

export const busSchema = z.object({
  name: z.string().min(2, "Bus name is required"),
  busNumber: z.string().min(4, "Bus number is required"),
  busType: z.enum(["seater_ac", "seater_non_ac", "sleeper_ac", "sleeper_non_ac"]),
  totalSeats: z.coerce.number().min(10).max(60),
  amenities: z.object({
    waterBottle: z.boolean().optional(),
    chargingPoint: z.boolean().optional(),
    tv: z.boolean().optional(),
    blanket: z.boolean().optional(),
  }).optional(),
});

export const routeSchema = z.object({
  busId: z.coerce.number().min(1, "Please select a bus"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  fare: z.coerce.number().min(0, "Fare must be positive"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  phone: z.string().min(10, "Phone number is required").optional(),
  address: z.string().optional(),
});