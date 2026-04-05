import { Router } from "express";
import {
    createRecordHandler,
    listRecordsHandler,
    getRecordHandler,
    updateRecordHandler,
    deleteRecordHandler,
    getRecordsSummaryHandler
} from "../controllers/recordController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validateBody, validateParams, validateQuery } from "../middleware/validationMiddleware";
import {
    createRecordBodySchema,
    updateRecordBodySchema,
    listRecordsQuerySchema,
    recordIdParamsSchema
} from "../validators/recordValidators";
import constants from "../config/constants";

const recordRouter = Router();

/**
 * Create a new record
 * POST /api/records
 * Authorization: admin only
 */
recordRouter.post(
    "/",
    authenticate,
    authorize(constants.ROLES.ADMIN),
    validateBody(createRecordBodySchema),
    createRecordHandler
);

/**
 * Get all records with filtering and pagination
 * GET /api/records
 * Authorization: analyst and admin only
 * Query params: page, limit, type, category, startDate, endDate
 */
recordRouter.get(
    "/",
    authenticate,
    authorize(constants.ROLES.ANALYST, constants.ROLES.ADMIN),
    validateQuery(listRecordsQuerySchema),
    listRecordsHandler
);

/**
 * Get records summary (statistics)
 * GET /api/records/summary
 * Authorization: analyst (own only), admin (all)
 * Query params: startDate, endDate (optional)
 */
recordRouter.get(
    "/summary",
    authenticate,
    authorize(constants.ROLES.ANALYST, constants.ROLES.ADMIN),
    getRecordsSummaryHandler
);

/**
 * Get a single record by ID
 * GET /api/records/:id
 * Authorization: analyst and admin only
 */
recordRouter.get(
    "/:id",
    authenticate,
    authorize(constants.ROLES.ANALYST, constants.ROLES.ADMIN),
    validateParams(recordIdParamsSchema),
    getRecordHandler
);

/**
 * Update a record
 * PATCH /api/records/:id
 * Authorization: admin only
 */
recordRouter.patch(
    "/:id",
    authenticate,
    authorize(constants.ROLES.ADMIN),
    validateParams(recordIdParamsSchema),
    validateBody(updateRecordBodySchema),
    updateRecordHandler
);

/**
 * Delete a record (soft delete)
 * DELETE /api/records/:id
 * Authorization: admin only
 */
recordRouter.delete(
    "/:id",
    authenticate,
    authorize(constants.ROLES.ADMIN),
    validateParams(recordIdParamsSchema),
    deleteRecordHandler
);

export default recordRouter;
