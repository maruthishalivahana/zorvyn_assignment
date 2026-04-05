import { Router } from "express";
import { getMe, getUser, listUsers, removeUser, setUserStatus } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validateBody, validateParams, validateQuery } from "../middleware/validationMiddleware";
import { listUsersQuerySchema, userIdParamsSchema, userStatusBodySchema } from "../validators/userValidators";
import constants from "../config/constants";

const userRouter = Router();

userRouter.get("/", authenticate, authorize(constants.ROLES.ADMIN), validateQuery(listUsersQuerySchema), listUsers);
userRouter.get("/me", authenticate, getMe);
userRouter.get("/:id", authenticate, authorize(constants.ROLES.ADMIN), validateParams(userIdParamsSchema), getUser);
userRouter.patch(
    "/:id/status",
    authenticate,
    authorize(constants.ROLES.ADMIN),
    validateParams(userIdParamsSchema),
    validateBody(userStatusBodySchema),
    setUserStatus
);
userRouter.delete("/:id", authenticate, authorize(constants.ROLES.ADMIN), validateParams(userIdParamsSchema), removeUser);

export default userRouter;
