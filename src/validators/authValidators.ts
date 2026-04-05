import { z } from "zod";

const strongPassword = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must include uppercase, lowercase and number");

export const registerBodySchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    email: z.string().trim().email("Please provide a valid email"),
    password: strongPassword,
    role: z.enum(["viewer", "analyst", "admin"]).optional()
});

export const loginBodySchema = z.object({
    email: z.string().trim().email("Please provide a valid email"),
    password: z.string().min(1, "Password is required")
});
