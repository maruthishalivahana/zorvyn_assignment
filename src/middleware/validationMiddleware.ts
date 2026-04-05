import { type NextFunction, type Request, type Response } from "express";
import { type ZodTypeAny, z } from "zod";

type ValidationSource = "body" | "query" | "params";

const formatIssues = (issues: z.ZodIssue[]) =>
    issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
    }));

export const validateRequest = (schema: ZodTypeAny, source: ValidationSource = "body") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatIssues(result.error.issues)
            });
            return;
        }

        // Express may expose query/params via getter-only properties in some runtimes.
        // Update body directly and merge query/params values in-place.
        if (source === "body") {
            req.body = result.data;
        } else {
            const target = req[source] as Record<string, unknown>;
            for (const key of Object.keys(target)) {
                delete target[key];
            }
            Object.assign(target, result.data as Record<string, unknown>);
        }
        next();
    };
};

export const validateBody = (schema: ZodTypeAny) => validateRequest(schema, "body");
export const validateQuery = (schema: ZodTypeAny) => validateRequest(schema, "query");
export const validateParams = (schema: ZodTypeAny) => validateRequest(schema, "params");
