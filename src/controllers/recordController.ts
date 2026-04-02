import { type Request, type Response, type NextFunction } from "express";
import { createRecord, getUserRecords } from "../services/recordService";
import { sendSuccess } from "../utils/responseHelper";

export const createUserRecord = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const record = await createRecord(req.body);
        sendSuccess(res, record, "Record created", 201);
    } catch (error) {
        next(error);
    }
};

export const listUserRecords = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const records = await getUserRecords(String(req.params.userId));
        sendSuccess(res, records, "Records fetched");
    } catch (error) {
        next(error);
    }
};
