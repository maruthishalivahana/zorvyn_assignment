import { type Response, type NextFunction } from "express";
import {
    createRecord,
    listRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
    getRecordsSummary
} from "../services/recordService";
import { sendSuccess, sendError } from "../utils/responseHelper";
import type { AuthRequest } from "../middleware/authMiddleware";
import constants from "../config/constants";

/**
 * Create a new record
 * Only admins can create records
 */
export const createRecordHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const record = await createRecord({
            ...req.body,
            userId: req.user!.id
        });
        sendSuccess(res, record, "Record created successfully", 201);
    } catch (error) {
        next(error);
    }
};

/**
 * List all records with filtering and pagination
 * Viewers: see only their own records
 * Analysts: see all records
 * Admins: see all records
 */
export const listRecordsHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page, limit, type, category, startDate, endDate } = req.query;

        // Viewers can only see their own records
        const userId = req.user!.role === constants.ROLES.VIEWER ? req.user!.id : undefined;

        const result = await listRecords({
            userId,
            type: type as "income" | "expense" | undefined,
            category: category as string | undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });

        sendSuccess(
            res,
            { records: result.data, pagination: result.pagination },
            "Records fetched successfully"
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single record by ID
 * Viewers: can only view their own records
 * Analysts and Admins: can view any record
 */
export const getRecordHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const record = await getRecordById(id);

        if (!record) {
            sendError(res, "Record not found", 404);
            return;
        }

        // Check authorization: viewers can only see their own records
        if (req.user!.role === constants.ROLES.VIEWER && record.userId.toString() !== req.user!.id) {
            sendError(res, "Unauthorized to view this record", 403);
            return;
        }

        sendSuccess(res, record, "Record fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * Update a record
 * Only admins can update records
 */
export const updateRecordHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const record = await getRecordById(id);

        if (!record) {
            sendError(res, "Record not found", 404);
            return;
        }

        const updatedRecord = await updateRecord(id, req.body);

        if (!updatedRecord) {
            sendError(res, "Failed to update record", 500);
            return;
        }

        sendSuccess(res, updatedRecord, "Record updated successfully", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a record (soft delete)
 * Only admins can delete records
 */
export const deleteRecordHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const record = await getRecordById(id);

        if (!record) {
            sendError(res, "Record not found", 404);
            return;
        }

        const deletedRecord = await deleteRecord(id, req.user!.id);

        if (!deletedRecord) {
            sendError(res, "Failed to delete record", 500);
            return;
        }

        sendSuccess(
            res,
            {
                id: deletedRecord._id,
                title: deletedRecord.title,
                amount: deletedRecord.amount,
                deletedAt: deletedRecord.deletedAt,
                deletedBy: deletedRecord.deletedBy
            },
            "Record deleted successfully"
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get summary statistics for records
 * Analysts and Admins: see summary for all records
 */
export const getRecordsSummaryHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        // Both analysts and admins see all records summary
        const summary = await getRecordsSummary({
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined
        });

        sendSuccess(res, summary, "Records summary fetched successfully");
    } catch (error) {
        next(error);
    }
};

// Deprecated: Use listRecordsHandler and createRecordHandler instead
export const createUserRecord = createRecordHandler;
export const listUserRecords = listRecordsHandler;
