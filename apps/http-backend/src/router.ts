import { Router } from "express";
import { chatcontroller, deletecontroller, getrooms, roomcontroller, signincontroller, signupcontroller, slugcontroller } from "./controller.js";
import { middleware } from "./middleware.js";

const userrouter:Router = Router();

userrouter.post("/signup",signupcontroller);
userrouter.post("/signin",signincontroller);
userrouter.post("/room",middleware,roomcontroller);
userrouter.get("/rooms",middleware,getrooms);
userrouter.get("/chats/:roomId",chatcontroller);
userrouter.get("/room/:slug",middleware,slugcontroller);
userrouter.get("/room/:id",middleware,deletecontroller);

export default userrouter;