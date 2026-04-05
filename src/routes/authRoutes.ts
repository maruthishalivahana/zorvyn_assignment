import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validationMiddleware";
import { loginBodySchema, registerBodySchema } from "../validators/authValidators";

const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
authRouter.post("/login", validateBody(loginBodySchema), login);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
