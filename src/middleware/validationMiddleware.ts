import { type NextFunction, type Request, type Response } from "express";

export type Validator = (req: Request) => string | null;

export const validate = (validators: Validator[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors = validators
            .map((validator) => validator(req))
            .filter((value): value is string => value !== null);

        if (errors.length > 0) {
            res.status(400).json({ success: false, message: "Validation failed", errors });
            return;
        }

        next();
    };
};
