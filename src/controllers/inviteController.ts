import { type NextFunction, type Request, type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware";
import { sendError, sendSuccess } from "../utils/responseHelper";
import { acceptInvite, createInvite, validateInviteToken } from "../services/inviteService";

const mapInviteErrorStatus = (message: string): number => {
    if (message.includes("already exists") || message.includes("pending invite")) {
        return 409;
    }

    if (message.includes("Invalid invite token") || message.includes("expired") || message.includes("pending")) {
        return 400;
    }

    return 500;
};

export const sendInvite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user?.id) {
            sendError(res, "Unauthorized", 401);
            return;
        }

        const invite = await createInvite({
            email: String(req.body.email),
            role: req.body.role,
            customMessage: req.body.customMessage,
            invitedBy: req.user.id
        });

        sendSuccess(
            res,
            {
                id: invite._id,
                email: invite.email,
                role: invite.role,
                status: invite.status,
                expiresAt: invite.expiresAt,
                token: invite.token
            },
            "Invitation sent successfully",
            201
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send invite";
        const status = mapInviteErrorStatus(message);
        if (status !== 500) {
            sendError(res, message, status);
            return;
        }
        next(error);
    }
};

export const validateInvite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await validateInviteToken(String(req.params.token));
        if (!result.valid) {
            sendError(res, result.reason || "Invalid invite", 400);
            return;
        }

        sendSuccess(res, { valid: true, invite: result.invite }, "Invite is valid");
    } catch (error) {
        next(error);
    }
};

export const acceptInviteAndCreateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await acceptInvite({
            token: String(req.body.token),
            name: String(req.body.name ?? req.body.fullName),
            password: String(req.body.password)
        });

        sendSuccess(
            res,
            {
                user: {
                    id: result.user._id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                    status: result.user.status
                },
                token: result.token,
                message: "Account created successfully. You are now logged in."
            },
            "Invite accepted",
            201
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to accept invite";
        const status = mapInviteErrorStatus(message);
        if (status !== 500) {
            sendError(res, message, status);
            return;
        }
        next(error);
    }
};
