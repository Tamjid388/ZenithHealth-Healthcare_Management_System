import { Doctor } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"

    const getAllDoctors=async()=>{
        const doctors=await prisma.doctor.findMany({
            include:{
                user:true,
                doctorSpecialities:{
                    include:{
                        speciality:true
                    }
                }
            }
        })
        return doctors
    }
    const getDoctorById=async(id:string)=>{
        const doctor=await prisma.doctor.findUnique({
            where:{
                id
            },
            include:{
                user:true,
                doctorSpecialities:{
                    include:{
                        speciality:true
                    }
                }
            }
        })
        return doctor
    }

    const updateDoctor=async(id:string,body:Partial<Doctor>)=>{
        const doctor=await prisma.doctor.update({
            where:{
                id
            },
            data:{
                ...body
            }
        })
        return doctor
    }


    const deleteDoctor=async(id:string)=>{
        const doctor=await prisma.doctor.update({
            where:{
                id
            },
            data:{
                isDeleted:true,
                deletedAt:new Date()
            }
        })
        return doctor
    }

    export const DoctorService={
        getAllDoctors,
        getDoctorById,
        updateDoctor,
        deleteDoctor
    }