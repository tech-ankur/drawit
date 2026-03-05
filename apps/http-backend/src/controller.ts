import { Request, Response } from "express";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import {prismaClient} from "@repo/db/client"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CustomRequest } from "./middleware.js";
export const signupcontroller = async  (req:Request,res:Response)=>{
    try {
            const parsedData=CreateUserSchema.safeParse({
        username:req.body.email,
        password:req.body.password,
        name:req.body.name
    });
   if(!parsedData.success){
    res.status(400).json({error:parsedData.error.flatten()});
    return;
   }
    const {username,password,name}=parsedData.data;
 const User= await  prismaClient.user.findFirst(
    {
        where:{
            email:username
        }
    }
 )
 if(User){
    res.status(400).json({error:"User already exists"});
    return;
}
const hassedPassword=await bcrypt.hash(password,10);
const newUser= await prismaClient.user.create({
    data:{
        email:username,
        password:hassedPassword,
        name:name
    }
})
return res.status(201).json({message:"User created successfully",user:{
    id:newUser.id,
    email:newUser.email,
    name:newUser.name
}});
    } catch (error) {
        return res.status(500).json({error:"Internal server error"});
    }
}

export const signincontroller =async (req:Request,res:Response)=>{
   try {
    const parsedData=SigninSchema.safeParse({
        username:req.body.email,
        password:req.body.password,
    });
    if(!parsedData.success){
        res.status(400).json({error:parsedData.error.flatten()});
        return;
       }
         const {username,password}=parsedData.data;
   const User=  await  prismaClient.user.findUnique({
            where:{
                email:username
            }
        })
        if(!User){
            res.status(401).json({error:"Invalid credentials"});
            return;
        }
        const isvalid=await bcrypt.compare(password,User.password);
        if(!isvalid){
            res.status(401).json({error:"Invalid credentials"});
            return;
        }
        const token=jwt.sign({userId:User.id},JWT_SECRET,{expiresIn:"7d"})
        res.status(200).json({message:"Signin successful",token});

   } catch (error) {
    res.status(500).json({error:"Internal server error"});
   }
}

export const roomcontroller =async (req:CustomRequest,res:Response)=>{
    const parsedData=CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({error:parsedData.error.flatten()});
        return;
       }
  try {
      const userId=req.userId;
    if(!userId){
        res.status(401).json({error:"Unauthorized"});
        return;
    }
  const room=  await prismaClient.room.create({
        data:{
           slug:parsedData.data.name,
           adminId:userId
        }
    })
    return res.json({roomid:room.id})
  } catch (error) {
    return res.json({error:"Internal server error"});
  }
}

export const chatcontroller =async (req:CustomRequest,res:Response)=>{
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
}

export const slugcontroller =async (req:CustomRequest,res:Response)=>{
    try {
        const slug = req.params.slug;
       if(typeof slug !== "string"){
        res.status(400).json({error:"Invalid slug"});
        return;
       }
        const messages = await prismaClient.room.findUnique({
            where: {
                slug:slug
            }
           
        });

        res.json({
            messages
        })
    } catch(e) {     
        res.json({
            messages: e
        })
    }
}