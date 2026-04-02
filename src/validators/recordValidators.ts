import { type Validator } from "../middleware/validationMiddleware";

export const createRecordValidators: Validator[] = [
    (req) => (!req.body?.userId ? "userId is required" : null),
    (req) => (!req.body?.title ? "title is required" : null),
    (req) =>
        req.body?.amount === undefined || req.body?.amount === null ? "amount is required" : null
];
