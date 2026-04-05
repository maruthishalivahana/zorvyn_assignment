import jwt, { type SignOptions } from "jsonwebtoken";
import { User, type IUser } from "../models/User";
import { env } from "../config/env";
import constants from "../config/constants";

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role?: string;
}

interface LoginPayload {
    email: string;
    password: string;
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

export const registerUser = async (payload: RegisterPayload): Promise<IUser> => {
    const normalizedEmail = normalizeEmail(payload.email);

    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
        throw new Error("User already exists");
    }

    // Password hashing is handled by the User model pre-save hook.
    return User.create({
        name: payload.name,
        email: normalizedEmail,
        password: payload.password,
        role: payload.role
    });
};

export const loginUser = async (payload: LoginPayload): Promise<{ token: string; user: IUser }> => {
    const normalizedEmail = normalizeEmail(payload.email);

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.status !== constants.USER_STATUS.ACTIVE) {
        throw new Error("Account is inactive");
    }

    const isPasswordValid = await user.comparePassword(payload.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    if (!env.jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = env.jwtExpiresIn as SignOptions["expiresIn"];

    const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
        expiresIn
    });

    return { token, user };
};
