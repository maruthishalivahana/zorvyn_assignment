import { z } from "zod";

const userStatuses = ["active", "inactive"] as const;
const userRoles = ["viewer", "analyst", "admin"] as const;

export const userIdParamsSchema = z.object({
    id: z.string().min(1, "id param is required")
});

export const userStatusBodySchema = z.object({
    status: z.enum(userStatuses)
});

export const listUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: z.enum(userRoles).optional(),
    status: z.enum(userStatuses).optional()
});
