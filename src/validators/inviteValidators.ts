import constants from "../config/constants";
import { type Validator } from "../middleware/validationMiddleware";

const validRoles = new Set(Object.values(constants.ROLES));

const requireField = (field: string): Validator => (req) => {
    const value = req.body?.[field];
    if (value === undefined || value === null || value === "") {
        return `${field} is required`;
    }
    return null;
};

export const createInviteValidators: Validator[] = [
    requireField("email"),
    requireField("role"),
    (req) => {
        const email = String(req.body?.email || "");
        return /^\S+@\S+\.\S+$/.test(email) ? null : "email must be valid";
    },
    (req) => {
        const role = String(req.body?.role || "");
        return validRoles.has(role as (typeof constants.ROLES)[keyof typeof constants.ROLES])
            ? null
            : "role is invalid";
    },
    (req) => {
        const message = req.body?.customMessage;
        if (message && String(message).length > 500) {
            return "customMessage must be at most 500 characters";
        }
        return null;
    }
];

export const validateInviteTokenParamValidator: Validator = (req) => {
    const token = req.params?.token;
    if (!token) {
        return "token param is required";
    }
    return null;
};

export const acceptInviteValidators: Validator[] = [
    requireField("token"),
    (req) => {
        const name = req.body?.name ?? req.body?.fullName;
        if (!name) {
            return "name is required";
        }
        return String(name).trim().length >= 2 ? null : "name must be at least 2 characters";
    },
    requireField("password"),
    (req) => {
        const password = String(req.body?.password || "");
        if (password.length < 8) {
            return "password must be at least 8 characters";
        }

        const strongPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        return strongPattern.test(password)
            ? null
            : "password must include uppercase, lowercase and number";
    }
];
