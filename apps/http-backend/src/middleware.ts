import { NextFunction, Response } from "express";
import { CustomRequest } from "./index.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
export const middleware=(req:CustomRequest,res:Response,next:NextFunction)=>{
try {
    const token=req.headers["authorization"]||"";

const decoded=jwt.verify(token,JWT_SECRET);
if(typeof decoded==="string"){
    return res.status(401).json({message:"Invalid token"});
}
req.userId=decoded.userId;
} catch (error) {
    res.status(401).json({message:"Unauthorized"})
}
next();
}