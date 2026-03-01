import { Router } from "express";
import { roomcontroller, signincontroller, signupcontroller } from "./controller.js";
import { middleware } from "./middleware.js";

const userrouter:Router = Router();

userrouter.post("/signup",signupcontroller);
userrouter.post("/signin",signincontroller);
userrouter.post("/room",middleware,roomcontroller);

export default userrouter;