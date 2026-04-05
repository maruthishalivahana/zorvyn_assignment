import { type NextFunction, type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/responseHelper";
import constants from "../config/constants";
import {
    getDashboardCategoryBreakdown,
    getDashboardRecentActivity,
    getDashboardSummary,
    getDashboardTrends,
    type DashboardCategoryType,
    type DashboardPeriodType
} from "../services/dashboardService";

type QueryValue = string | string[] | number | boolean | null | undefined;

const firstQueryValue = (value: unknown): string | undefined => {
    if (Array.isArray(value)) {
        return typeof value[0] === "string" ? value[0] : undefined;
    }

    return typeof value === "string" ? value : undefined;
};

const parseDate = (value: unknown): Date | undefined => {
    const rawValue = firstQueryValue(value);

    if (!rawValue) {
        return undefined;
    }

    const parsed = new Date(rawValue);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const getScope = (_req: AuthRequest): { userId?: string } => {
    // All users (viewers, analysts, admins) see the same aggregated dashboard data
    // No filtering by userId - dashboard shows global totals for all records
    // Viewers have READ-ONLY access to view aggregate statistics
    return {};
};

const handleInvalidDateRange = (res: Response, error: unknown): boolean => {
    if (error instanceof Error && error.message === "Invalid date range") {
        sendError(res, "Invalid date range", 400);
        return true;
    }

    return false;
};

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query as Record<string, unknown>;
        const startDate = parseDate(query.startDate);
        const endDate = parseDate(query.endDate);
        const stats = await getDashboardSummary({ ...getScope(req), startDate, endDate });

        sendSuccess(res, stats, "Dashboard summary fetched");
    } catch (error) {
        if (handleInvalidDateRange(res, error)) {
            return;
        }

        next(error);
    }
};

export const getCategoryBreakdown = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = req.query as Record<string, unknown>;
        const startDate = parseDate(query.startDate);
        const endDate = parseDate(query.endDate);
        const type = (firstQueryValue(query.type) || "all") as DashboardCategoryType;

        const breakdown = await getDashboardCategoryBreakdown({
            ...getScope(req),
            startDate,
            endDate,
            type
        });

        sendSuccess(res, breakdown, "Dashboard category breakdown fetched");
    } catch (error) {
        if (handleInvalidDateRange(res, error)) {
            return;
        }

        next(error);
    }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query as Record<string, unknown>;
        const period = (firstQueryValue(query.period) || "monthly") as DashboardPeriodType;
        const monthsValue = Number(firstQueryValue(query.months) || 6);
        const trends = await getDashboardTrends(getScope(req), period, monthsValue);

        sendSuccess(res, trends, "Dashboard trends fetched");
    } catch (error) {
        next(error);
    }
};

export const getRecentActivity = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = req.query as Record<string, unknown>;
        const limit = Number(firstQueryValue(query.limit) || 10);
        const activity = await getDashboardRecentActivity(getScope(req), limit);

        sendSuccess(res, activity, "Dashboard recent activity fetched");
    } catch (error) {
        next(error);
    }
};

export const getDashboard = getSummary;
