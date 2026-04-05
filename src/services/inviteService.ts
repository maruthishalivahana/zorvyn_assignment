import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import constants from "../config/constants";
import { env } from "../config/env";
import { Invite, type IInvite } from "../models/Invite";
import { User, type IUser } from "../models/User";
import { sendInviteEmail } from "./emailService";

interface CreateInvitePayload {
    email: string;
    role: (typeof constants.ROLES)[keyof typeof constants.ROLES];
    customMessage?: string;
    invitedBy: string;
}

interface AcceptInvitePayload {
    token: string;
    name: string;
    password: string;
}

interface ValidateInviteResult {
    valid: boolean;
    invite?: Pick<IInvite, "email" | "role" | "expiresAt">;
    reason?: string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (email: string): Promise<IUser | null> =>
    User.findOne({
        email: {
            $regex: `^${escapeRegex(email)}$`,
            $options: "i"
        }
    });

const generateToken = (): string => crypto.randomUUID();

const ensureInviteIsPendingAndActive = async (invite: IInvite): Promise<void> => {
    if (invite.status !== constants.INVITE_STATUS.PENDING) {
        throw new Error("Invite is no longer pending");
    }

    if (invite.expiresAt < new Date()) {
        invite.status = constants.INVITE_STATUS.EXPIRED;
        await invite.save();
        throw new Error("Invite has expired");
    }
};

const generateAuthToken = (user: IUser): string => {
    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = env.jwtExpiresIn as SignOptions["expiresIn"];

    return jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
        expiresIn
    });
};

export const createInvite = async (payload: CreateInvitePayload): Promise<IInvite> => {
    const normalizedEmail = normalizeEmail(payload.email);

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
        throw new Error("User already exists");
    }

    const pendingInvite = await Invite.findOne({
        email: normalizedEmail,
        status: constants.INVITE_STATUS.PENDING,
        expiresAt: { $gt: new Date() }
    });

    if (pendingInvite) {
        throw new Error("A pending invite already exists for this email");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + constants.INVITE_EXPIRY_DAYS);

    const invite = await Invite.create({
        email: normalizedEmail,
        token: generateToken(),
        role: payload.role,
        status: constants.INVITE_STATUS.PENDING,
        invitedBy: payload.invitedBy,
        expiresAt,
        customMessage: payload.customMessage ?? null
    });

    await sendInviteEmail({
        email: invite.email,
        role: invite.role,
        token: invite.token,
        expiresAt: invite.expiresAt,
        customMessage: invite.customMessage
    });

    return invite;
};

export const validateInviteToken = async (token: string): Promise<ValidateInviteResult> => {
    const invite = await Invite.findOne({ token });

    if (!invite) {
        return { valid: false, reason: "Invite token not found" };
    }

    if (invite.status !== constants.INVITE_STATUS.PENDING) {
        return { valid: false, reason: "Invite is no longer pending" };
    }

    if (invite.expiresAt < new Date()) {
        invite.status = constants.INVITE_STATUS.EXPIRED;
        await invite.save();
        return { valid: false, reason: "Invite has expired" };
    }

    return {
        valid: true,
        invite: {
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt
        }
    };
};

export const acceptInvite = async (
    payload: AcceptInvitePayload
): Promise<{ user: IUser; token: string }> => {
    const invite = await Invite.findOne({ token: payload.token });
    if (!invite) {
        throw new Error("Invalid invite token");
    }

    await ensureInviteIsPendingAndActive(invite);

    const existingUser = await findUserByEmail(invite.email);
    if (existingUser) {
        throw new Error("User already exists");
    }

    const user = await User.create({
        email: invite.email,
        password: payload.password,
        name: payload.name,
        role: invite.role,
        status: constants.USER_STATUS.ACTIVE,
        createdBy: invite.invitedBy
    });

    invite.status = constants.INVITE_STATUS.ACCEPTED;
    invite.acceptedAt = new Date();
    await invite.save();

    return { user, token: generateAuthToken(user) };
};
