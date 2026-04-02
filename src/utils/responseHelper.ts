import { Response } from "express";

export const sendSuccess = <T>(res: Response, data: T, message = "Success", status = 200): void => {
    res.status(status).json({ success: true, message, data });
};

export const sendError = (res: Response, message = "Error", status = 500): void => {
    res.status(status).json({ success: false, message });
};
