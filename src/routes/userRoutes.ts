import { Router } from "express";
import { getUser, listUsers, setUserStatus } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { statusUpdateValidators, userIdParamValidator } from "../validators/userValidators";
import constants from "../config/constants";

const userRouter = Router();

userRouter.get("/", authenticate, authorize(constants.ROLES.ADMIN), listUsers);
userRouter.get("/:id", authenticate, validate([userIdParamValidator]), getUser);
userRouter.patch(
    "/:id/status",
    authenticate,
    authorize(constants.ROLES.ADMIN),
    validate([userIdParamValidator, ...statusUpdateValidators]),
    setUserStatus
);

export default userRouter;
