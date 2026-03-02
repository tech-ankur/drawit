import { Router } from "express";
import { chatcontroller, roomcontroller, signincontroller, signupcontroller } from "./controller.js";
import { middleware } from "./middleware.js";

const userrouter:Router = Router();

userrouter.post("/signup",signupcontroller);
userrouter.post("/signin",signincontroller);
userrouter.post("/room",middleware,roomcontroller);
userrouter.get("/chats/:roomId",middleware,chatcontroller);

export default userrouter;