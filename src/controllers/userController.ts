import { type Request, type Response, type NextFunction } from "express";
import { type AuthRequest } from "../middleware/authMiddleware";
import { deleteUser, getAllUsers, getMyProfile, getUserById, updateUserStatus } from "../services/userService";
import { sendError, sendSuccess } from "../utils/responseHelper";

export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = _req.query as unknown as {
            page?: number;
            limit?: number;
            role?: string;
            status?: string;
        };
        const result = await getAllUsers({
            page: Number(query.page ?? 1),
            limit: Number(query.limit ?? 20),
            role: query.role,
            status: query.status
        });

        res.status(200).json({
            success: true,
            data: result
        });
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

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            sendError(res, "Unauthorized", 401);
            return;
        }

        const user = await getMyProfile(userId);

        if (!user) {
            sendError(res, "User not found", 404);
            return;
        }

        sendSuccess(res, user, "Profile fetched");
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
        next(error);
    }
};

export const removeUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await deleteUser(String(req.params.id));

        if (!user) {
            sendError(res, "User not found", 404);
            return;
        }

        sendSuccess(
            res,
            {
                id: String(user._id),
                email: user.email,
                fullName: user.name,
                role: user.role,
                status: user.status
            },
            "User deleted"
        );
    } catch (error) {
        next(error);
    }
};
