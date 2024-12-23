import { Router } from "express";
import { login, signup, verifyLogin } from "../controllers/usersController.js";
const userRouter = Router();

userRouter.route('/signup').post(signup);
userRouter.route('/login').post(login);
userRouter.route('/verifyToken').post(verifyLogin);

export default userRouter;