import { prisma } from "../../../app/lib/prisma";
const createSpeciality = async (payload) => {
    const speciality = await prisma.speciality.create({
        data: payload,
    });
    return speciality;
};
const getAllSpecialities = async () => {
    const speciality = await prisma.speciality.findMany();
    return speciality;
};
const deleteSpecialityById = async (id) => {
    const speciality = await prisma.speciality.delete({
        where: { id },
    });
    return speciality;
};
const updateSpeciality = async (id, payload) => {
    const updatedInfo = await prisma.speciality.update({
        data: payload,
        where: {
            id,
        },
    });
    return updatedInfo;
};
export const SpecialityService = {
    createSpeciality,
    getAllSpecialities,
    deleteSpecialityById,
    updateSpeciality,
};
