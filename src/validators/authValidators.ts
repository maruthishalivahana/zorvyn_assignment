import { type Validator } from "../middleware/validationMiddleware";
import constants from "../config/constants";

const requireField = (field: string): Validator => (req) => {
    const value = req.body?.[field];
    if (value === undefined || value === null || value === "") {
        return `${field} is required`;
    }
    return null;
};

export const registerValidators: Validator[] = [
    requireField("name"),
    requireField("email"),
    requireField("password"),
    (req) => {
        const role = req.body?.role;
        if (role === undefined || role === null || role === "") {
            return null;
        }

        return Object.values(constants.ROLES).includes(role) ? null : "role must be viewer, analyst, or admin";
    }
];

export const loginValidators: Validator[] = [requireField("email"), requireField("password")];
