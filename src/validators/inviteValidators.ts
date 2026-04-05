import { z } from "zod";

export const createInviteBodySchema = z.object({
    email: z.string().trim().email("Please provide a valid email"),
    role: z.enum(["viewer", "analyst", "admin"]),
    customMessage: z.string().trim().max(500, "customMessage must be at most 500 characters").optional()
});

export const validateInviteTokenParamsSchema = z.object({
    token: z.string().min(1, "token param is required")
});

export const acceptInviteBodySchema = z
    .object({
        token: z.string().min(1, "token is required"),
        name: z.string().trim().min(2, "name must be at least 2 characters").optional(),
        fullName: z.string().trim().min(2, "name must be at least 2 characters").optional(),
        password: z
            .string()
            .min(8, "password must be at least 8 characters")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "password must include uppercase, lowercase and number")
    })
    .transform((value) => ({
        token: value.token,
        name: value.name ?? value.fullName ?? "",
        password: value.password
    }));
