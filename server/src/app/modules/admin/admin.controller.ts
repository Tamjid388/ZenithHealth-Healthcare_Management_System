import { catchAsync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";

const getAdminById=()=>catchAsync(async(req: Request, res: Response)=>{
    const {id}=req.params
    console.log(id)
    const result=await AdminService.getAdminById(id as string)
        sendResponse(res, {
        httpStatusCode: 200,
        success: true,
        message: "Admin fetched successfully",
        data: result
    })
})

export const AdminController={
    getAdminById
}