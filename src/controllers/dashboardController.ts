import { type Request, type Response, type NextFunction } from "express";
import { getDashboardStats } from "../services/dashboardService";
import { sendSuccess } from "../utils/responseHelper";

export const getDashboard = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const stats = await getDashboardStats();
        sendSuccess(res, stats, "Dashboard stats fetched");
    } catch (error) {
        next(error);
    }
};
