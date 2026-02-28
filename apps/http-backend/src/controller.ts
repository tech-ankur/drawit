import { Request, Response } from "express";
import { CreateUserSchema } from "@repo/common/types";
export const signupcontroller = (req:Request,res:Response)=>{
    const parsedData=CreateUserSchema.safeParse(req.body);
    res.send("signup");
}
export const signincontroller = (req:Request,res:Response)=>{
    res.send("signin");
}

export const roomcontroller = (req:Request,res:Response)=>{
    res.send("room");
}