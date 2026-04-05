import { Router } from "express";
import {
    getCategoryBreakdown,
    getDashboard,
    getRecentActivity,
    getSummary,
    getTrends
} from "../controllers/dashboardController";
import { authenticate } from "../middleware/authMiddleware";
import { validateQuery } from "../middleware/validationMiddleware";
import {
    dashboardCategoryBreakdownQuerySchema,
    dashboardRecentActivityQuerySchema,
    dashboardSummaryQuerySchema,
    dashboardTrendsQuerySchema
} from "../validators/dashboardValidators";
import { authorize } from "../middleware/roleMiddleware";
import constants from "../config/constants";

const dashboardRouter = Router();

// All authenticated users can view dashboard (viewers see own, analysts/admins see all)
dashboardRouter.get("/", authenticate, authorize(constants.ROLES.VIEWER, constants.ROLES.ANALYST, constants.ROLES.ADMIN), validateQuery(dashboardSummaryQuerySchema), getDashboard);
dashboardRouter.get("/summary", authenticate, authorize(constants.ROLES.VIEWER, constants.ROLES.ANALYST, constants.ROLES.ADMIN), validateQuery(dashboardSummaryQuerySchema), getSummary);
dashboardRouter.get(
    "/category-breakdown",
    authenticate,
    authorize(constants.ROLES.VIEWER, constants.ROLES.ANALYST, constants.ROLES.ADMIN),
    validateQuery(dashboardCategoryBreakdownQuerySchema),
    getCategoryBreakdown
);
dashboardRouter.get("/trends", authenticate, authorize(constants.ROLES.VIEWER, constants.ROLES.ANALYST, constants.ROLES.ADMIN), validateQuery(dashboardTrendsQuerySchema), getTrends);
dashboardRouter.get(
    "/recent-activity",
    authenticate,
    authorize(constants.ROLES.VIEWER, constants.ROLES.ANALYST, constants.ROLES.ADMIN),
    validateQuery(dashboardRecentActivityQuerySchema),
    getRecentActivity
);

export default dashboardRouter;
