import { type NextFunction, type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import constants from "../config/constants";
import { User } from "../models/User";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        status: string;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!env.jwtSecret) {
            res.status(500).json({ success: false, message: "JWT secret is not configured" });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
        const user = await User.findById(String(decoded.id)).select("role status");

        if (!user) {
            res.status(401).json({ success: false, message: "Invalid token" });
            return;
        }

        if (user.status !== constants.USER_STATUS.ACTIVE) {
            res.status(403).json({ success: false, message: "Account is inactive" });
            return;
        }

        req.user = {
            id: String(decoded.id),
            role: String(user.role),
            status: String(user.status)
        };

        next();
    } catch (_error) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};
