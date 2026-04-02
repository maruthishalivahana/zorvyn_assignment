import { type NextFunction, type Request, type Response } from "express";
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
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
};
