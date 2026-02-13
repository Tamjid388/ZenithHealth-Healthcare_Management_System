import { Request, Response } from "express";
import { SpecialityService } from "./speciality.service";
import strict from "node:assert/strict";

const createSpeciality = async (req: Request, res: Response) => {
  const result = await SpecialityService.createSpeciality(req.body);
  res.status(200).json({ success: true,
    message:"Speciality Created Successfully",
    data: result });
};

const getAllSpecialities = async (req: Request, res: Response) => {
  try {
    const result = await SpecialityService.getAllSpecialities();
    res.status(200).json({
      success: true,
      message: "Specialities fetched successfully",
      data: result,
    });
  } catch (err:any) {
    res.status(500).json({ success: false, 
        error:err.message,
        message: "Something went wrong" });
  }
};

const deleteSpecialityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await SpecialityService.deleteSpecialityById(id as string);
    res.status(200).json({
      success: true,
      message: "Speciality deleted successfully",
      data: result,
    });
  } catch (err:any) {
    res.status(500).json({ success: false,error:err.message, message: "Failed to delete speciality" });
  }
};

const updateSpeciality = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const result = await SpecialityService.updateSpeciality(id as string, data);
    
    res.status(200).json({
      success: true,
      message: "Speciality updated successfully",
      data: result,
    });
  } catch (err:any) {
    res.status(500).json({
      success: false,
      error:err.message,
      message: "Failed to update speciality",
    });
  }
};

export const SpecialityController = { createSpeciality ,getAllSpecialities,
  deleteSpecialityById,updateSpeciality};
