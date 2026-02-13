import { prisma } from "../../app/lib/prisma";
import { Speciality } from "../../generated/prisma/client";


const createSpeciality = async (payload:Speciality):Promise<Speciality> => {
  const speciality=await prisma.speciality.create({
    data:payload
  })
  return speciality
};
const getAllSpecialities = async (): Promise<Speciality[]> => {
const speciality=await prisma.speciality.findMany()
return speciality
};


const deleteSpecialityById = async (id: string): Promise<Speciality> => {
const speciality=await prisma.speciality.delete({
    where:{id}
})
return speciality
};


const updateSpeciality = async (id: string, payload: any): Promise<Speciality | null> => {
 const updatedInfo=await prisma.speciality.update({
    data:payload,
    where:{
        id
    }
 },
)
  return updatedInfo; 
};



export const SpecialityService = { createSpeciality,getAllSpecialities,
  deleteSpecialityById,updateSpeciality };