import { type Request, type Response, type NextFunction } from "express";
import { loginUser, registerUser } from "../services/authService";
import { sendError, sendSuccess } from "../utils/responseHelper";

const getAuthErrorStatus = (message: string): number => {
    if (message.includes("Invalid email or password")) {
        return 401;
    }

    if (message.includes("Account is inactive")) {
        return 403;
    }

    if (message.includes("User already exists")) {
        return 409;
    }

    return 500;
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await registerUser(req.body);
        sendSuccess(res, { id: user._id, email: user.email, role: user.role }, "User registered", 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        const status = getAuthErrorStatus(message);
        if (status !== 500) {
            sendError(res, message, status);
            return;
        }

        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await loginUser(req.body);
        sendSuccess(
            res,
            {
                token: result.token,
                user: {
                    id: result.user._id,
                    email: result.user.email,
                    role: result.user.role,
                    name: result.user.name
                }
            },
            "Login successful"
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        const status = getAuthErrorStatus(message);
        if (status !== 500) {
            sendError(res, message, status);
            return;
        }

        next(error);
    }
};
