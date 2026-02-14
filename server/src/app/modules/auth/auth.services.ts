import { Role, User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPayload{
    name:string;
    email:string;
    password:string
}

const registerPatient=async(payload:IRegisterPayload)=>{
    const {name,email,password}=payload
    const data= await auth.api.signUpEmail({
        body:{
            name,
            email,
            password
        }
    })

    if(!data.user){
        throw new Error("Failed to register patient")
    }
    //todo:create patient profile
    // const patient=await prisma.$transaction(async(tx)=>{
        
    // })
    return data
}
const loginUser=async(payload:{email:string,password:string})=>{
    const {email,password}=payload
    const data=await auth.api.signInEmail({
        body:{
            email,
            password
        }
    })
    if(data.user.status===UserStatus.BLOCKED){
        throw new Error("User Is Blocked")
    }
  
return data
}

export const authService={
    registerPatient,loginUser
}