import { type NextFunction, type Response } from "express";
import { type AuthRequest } from "./authMiddleware";

export const authorize = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Forbidden" });
            return;
        }

        if (req.user.status !== "active") {
            res.status(403).json({ success: false, message: "Account is inactive" });
            return;
        }

        next();
    };
};
