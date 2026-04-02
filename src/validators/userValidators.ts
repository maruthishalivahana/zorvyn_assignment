import { type Validator } from "../middleware/validationMiddleware";
import constants from "../config/constants";

export const userIdParamValidator: Validator = (req) => {
    if (!req.params.id) {
        return "id param is required";
    }
    return null;
};

export const statusUpdateValidators: Validator[] = [
    (req) => {
        const status = req.body?.status;
        if (!status) {
            return "status is required";
        }

        return Object.values(constants.USER_STATUS).includes(status)
            ? null
            : "status must be active or inactive";
    }
];
