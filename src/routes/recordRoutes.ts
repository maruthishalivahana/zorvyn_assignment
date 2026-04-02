import { Router } from "express";
import { createUserRecord, listUserRecords } from "../controllers/recordController";
import { authenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { createRecordValidators } from "../validators/recordValidators";

const recordRouter = Router();

recordRouter.post("/", authenticate, validate(createRecordValidators), createUserRecord);
recordRouter.get("/user/:userId", authenticate, listUserRecords);

export default recordRouter;
