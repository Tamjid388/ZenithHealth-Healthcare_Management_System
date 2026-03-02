import { catchAsync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";

import status from "http-status";
import { IReqUser } from "../../interfaces";

const getAdminById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const admin = await AdminService.getAdminById(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin fetched successfully",
            data: admin,
        })
    }
)
const getAllAdmins = catchAsync(async(req: Request, res: Response)=>{
    console.log("Route hit") 
    const result=await AdminService.getAllAdmins()
        sendResponse(res, {
        httpStatusCode:status.OK,
        success: true,
        message: "All Admins fetched successfully",
        data: result
    })
})

const updateAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;

        const updatedAdmin = await AdminService.updateAdmin(id as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin updated successfully",
            data: updatedAdmin,
        })
    }
)
const  deleteAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
      const user=req?.user

        const updatedAdmin = await AdminService.deleteAdmin(id as string,user as IReqUser);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admin deleted successfully ",
            data: updatedAdmin,
        })
    }
)


export const AdminController={
    getAdminById,getAllAdmins,updateAdmin,deleteAdmin
}