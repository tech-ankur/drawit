import { Router } from "express";
import { roomcontroller, signincontroller, signupcontroller } from "./controller.js";

const userrouter:Router = Router();

userrouter.post("/signup",signupcontroller);
userrouter.post("/signin",signincontroller);
userrouter.post("/room",roomcontroller);

export default userrouter;