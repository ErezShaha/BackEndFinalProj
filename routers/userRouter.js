import { Router } from "express";
import { login, signup, verifyToken, logout } from "../controllers/usersController.js";
const userRouter = Router();

userRouter.route('/signup').post(signup);
userRouter.route('/login').post(login);
userRouter.route('/verifyToken').post(verifyToken);
userRouter.route('/logout').post(logout);

export default userRouter;