import { Router } from "express";
//import { login, signup, verifyLogin } from "../controllers/usersController.js";
const lobbyRouter = Router();

lobbyRouter.route('/signup').post(signup);
lobbyRouter.route('/login').post(login);
lobbyRouter.route('/verifyToken').post(verifyLogin);

export default lobbyRouter;