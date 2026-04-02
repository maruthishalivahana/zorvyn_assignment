import { Router } from "express";
import {
    acceptInviteAndCreateAccount,
    sendInvite,
    validateInvite
} from "../controllers/inviteController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validationMiddleware";
import constants from "../config/constants";
import {
    acceptInviteValidators,
    createInviteValidators,
    validateInviteTokenParamValidator
} from "../validators/inviteValidators";

const inviteRouter = Router();

inviteRouter.post("/", authenticate, authorize(constants.ROLES.ADMIN), validate(createInviteValidators), sendInvite);
inviteRouter.get("/validate/:token", validate([validateInviteTokenParamValidator]), validateInvite);
inviteRouter.post("/accept", validate(acceptInviteValidators), acceptInviteAndCreateAccount);

export default inviteRouter;
