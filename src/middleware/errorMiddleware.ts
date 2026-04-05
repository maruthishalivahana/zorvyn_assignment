import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export const notFoundHandler = (_req: Request, res: Response): void => {
    res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error(err.message);

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        });
        return;
    }

    res.status(500).json({ success: false, message: err.message || "Internal server error" });
};
