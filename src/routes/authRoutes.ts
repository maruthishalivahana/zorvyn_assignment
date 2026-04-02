import { Router } from "express";
import { login, register } from "../controllers/authController";
import { validate } from "../middleware/validationMiddleware";
import { loginValidators, registerValidators } from "../validators/authValidators";

const authRouter = Router();

authRouter.post("/register", validate(registerValidators), register);
authRouter.post("/login", validate(loginValidators), login);

export default authRouter;
