import { Router } from "express";
import {
    acceptInviteAndCreateAccount,
    sendInvite,
    validateInvite
} from "../controllers/inviteController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validateBody, validateParams } from "../middleware/validationMiddleware";
import constants from "../config/constants";
import {
    acceptInviteBodySchema,
    createInviteBodySchema,
    validateInviteTokenParamsSchema
} from "../validators/inviteValidators";

const inviteRouter = Router();

inviteRouter.post("/", authenticate, authorize(constants.ROLES.ADMIN), validateBody(createInviteBodySchema), sendInvite);
inviteRouter.get("/validate/:token", validateParams(validateInviteTokenParamsSchema), validateInvite);
inviteRouter.post("/accept", validateBody(acceptInviteBodySchema), acceptInviteAndCreateAccount);

export default inviteRouter;
