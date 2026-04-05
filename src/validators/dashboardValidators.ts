import { z } from "zod";

const optionalDateSchema = z.preprocess(
    (value) => {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        if (value instanceof Date) {
            return value;
        }

        if (typeof value === "string") {
            return new Date(value);
        }

        return value;
    },
    z.date().optional()
);

export const dashboardSummaryQuerySchema = z
    .object({
        startDate: optionalDateSchema,
        endDate: optionalDateSchema
    })
    .refine(
        (value) => !value.startDate || !value.endDate || value.startDate <= value.endDate,
        {
            message: "Invalid date range",
            path: ["endDate"]
        }
    );

export const dashboardCategoryBreakdownQuerySchema = z
    .object({
        startDate: optionalDateSchema,
        endDate: optionalDateSchema,
        type: z.enum(["income", "expense", "all"]).optional().default("all")
    })
    .refine(
        (value) => !value.startDate || !value.endDate || value.startDate <= value.endDate,
        {
            message: "Invalid date range",
            path: ["endDate"]
        }
    );

export const dashboardTrendsQuerySchema = z.object({
    period: z.enum(["monthly", "weekly"]).optional().default("monthly"),
    months: z.coerce.number().int().min(1).max(12).optional().default(6)
});

export const dashboardRecentActivityQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).optional().default(10)
});
