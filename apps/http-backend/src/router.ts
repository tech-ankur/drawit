import { Router } from "express";
import { chatcontroller, roomcontroller, signincontroller, signupcontroller, slugcontroller } from "./controller.js";
import { middleware } from "./middleware.js";

const userrouter:Router = Router();

userrouter.post("/signup",signupcontroller);
userrouter.post("/signin",signincontroller);
userrouter.post("/room",middleware,roomcontroller);
userrouter.get("/chats/:roomId",middleware,chatcontroller);
userrouter.get("/room/:slug",middleware,slugcontroller);

export default userrouter;