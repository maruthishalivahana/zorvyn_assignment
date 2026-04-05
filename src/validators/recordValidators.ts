import { z } from "zod";

const recordTypes = ["income", "expense"] as const;

// Create record - admin only
export const createRecordBodySchema = z.object({
    title: z.string().trim().min(1, "title is required").max(100, "title cannot exceed 100 characters"),
    type: z.enum(recordTypes),
    category: z.string().trim().min(2, "category must be at least 2 characters").max(50, "category cannot exceed 50 characters").toLowerCase(),
    amount: z.preprocess(
        (value) => (value === undefined || value === null || value === "" ? undefined : value),
        z.number()
            .positive("amount must be greater than 0")
            .multipleOf(0.01, "amount must have at most 2 decimal places")
    ),
    description: z.string().trim().max(500, "description cannot exceed 500 characters").nullable().optional(),
    date: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date()
    ).optional()
});

// Update record - admin only (partial fields)
export const updateRecordBodySchema = z.object({
    title: z.string().trim().min(1, "title is required").max(100, "title cannot exceed 100 characters").optional(),
    type: z.enum(recordTypes).optional(),
    category: z.string().trim().min(2, "category must be at least 2 characters").max(50, "category cannot exceed 50 characters").toLowerCase().optional(),
    amount: z.preprocess(
        (value) => (value === undefined || value === null || value === "" ? undefined : value),
        z.number()
            .positive("amount must be greater than 0")
            .multipleOf(0.01, "amount must have at most 2 decimal places")
    ).optional(),
    description: z.string().trim().max(500, "description cannot exceed 500 characters").nullable().optional(),
    date: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date()
    ).optional()
}).refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: "At least one field must be provided for update"
});

// List records query parameters - filtering and pagination
export const listRecordsQuerySchema = z.object({
    page: z.preprocess(Number, z.number().int().positive()).optional(),
    limit: z.preprocess(Number, z.number().int().positive().max(100)).optional(),
    type: z.enum(recordTypes).optional(),
    category: z.string().trim().toLowerCase().optional(),
    startDate: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date().optional()
    ),
    endDate: z.preprocess(
        (value) => (typeof value === "string" ? new Date(value) : value),
        z.date().optional()
    )
});

// Record ID params
export const recordIdParamsSchema = z.object({
    id: z.string().trim().min(1, "record id is required")
});
