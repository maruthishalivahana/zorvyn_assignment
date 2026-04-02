import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import constants from "../config/constants";

const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, authorize(constants.ROLES.ADMIN), getDashboard);

export default dashboardRouter;
