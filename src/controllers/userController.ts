import { type Request, type Response, type NextFunction } from "express";
import { getAllUsers, getUserById, updateUserStatus } from "../services/userService";
import { sendError, sendSuccess } from "../utils/responseHelper";

export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsers();
        sendSuccess(res, users, "Users fetched");
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await getUserById(String(req.params.id));
        if (!user) {
            sendError(res, "User not found", 404);
            return;
        }

        sendSuccess(res, user, "User fetched");
    } catch (error) {
        next(error);
    }
};

export const setUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await updateUserStatus(String(req.params.id), String(req.body.status));

        if (!user) {
            sendError(res, "User not found", 404);
            return;
        }

        sendSuccess(res, user, "User status updated");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update user status";
        if (message === "Invalid status value") {
            sendError(res, message, 400);
            return;
        }

        next(error);
    }
};
