import { uuidv7 } from "zod";
import { IReqUser } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { IAppointmentPayload } from "./appointment.interface";

const bookAppointment = async (payload: IAppointmentPayload,user:IReqUser) =>{
    const patientData=await prisma.patient.findFirstOrThrow({
        where:{
            email:user.email
        }
    })
    const doctorData=await prisma.doctor.findFirstOrThrow({
        where:{
            id:payload.doctorId,
            isDeleted:false
        }
    })
    const doctorSchedules=await prisma.doctorSchedules.findUniqueOrThrow({
        where:{
           doctorId_scheduleId:{
            doctorId:payload.doctorId,
            scheduleId:payload.scheduleId
           }
        }
    })
    const videoCallingId=String(uuidv7());
    const result=await prisma.$transaction(async(tx)=>{
        const appointment=await tx.appointment.create({
            data:{
                videoCallingId,
                patientId:patientData.id,
                doctorId:doctorData.id,
                scheduleId:payload.scheduleId
            }
        })
    })

}