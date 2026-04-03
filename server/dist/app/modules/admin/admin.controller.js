import { catchAsync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
const getAdminById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const admin = await AdminService.getAdminById(id);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin fetched successfully",
        data: admin,
    });
});
const getAllAdmins = catchAsync(async (req, res) => {
    console.log("Route hit");
    const result = await AdminService.getAllAdmins();
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "All Admins fetched successfully",
        data: result
    });
});
const updateAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedAdmin = await AdminService.updateAdmin(id, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin updated successfully",
        data: updatedAdmin,
    });
});
const deleteAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req?.user;
    const updatedAdmin = await AdminService.deleteAdmin(id, user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin deleted successfully ",
        data: updatedAdmin,
    });
});
export const AdminController = {
    getAdminById, getAllAdmins, updateAdmin, deleteAdmin
};
