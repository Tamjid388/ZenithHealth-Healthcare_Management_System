import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { envVars } from "./env"
import AppError from "../errorHelpers/AppError";
import status from "http-status";



cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
    api_key: envVars.CLOUDINARY.API_KEY,
    api_secret: envVars.CLOUDINARY.API_SECRET
})



// export const uploadFileToCloudinary = async (file) => {
//     try {
//         const result = await cloudinary.uploader.upload(file.path, {
//             resource_type: "image"
//         })
//         return result
//     } catch (error) {
//         throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload file to cloudinary")
//     }
// }

export const uploadFileToCloudinary = async (
    buffer: Buffer,
    fileName: string,
   
):Promise<UploadApiResponse> => {
if(!buffer || !fileName){
    throw new AppError(status.BAD_REQUEST, "File and Buffer are required")
}

       const fileExtension=fileName.split(".").pop()?.toLowerCase();
       const filenameWithoutExtension=fileName.split(".")
       .splice(0,-1).join(".").toLowerCase().replace(/\s/g,"-")
       .replace(/[^a-z0-9-]/g,"")

       const uniqueFilename=Math.random().toString(36).substring(2)+
       "-"+Date.now()+
       "-"+filenameWithoutExtension
       const folder=fileExtension==="pdf"?"pdfs":"images"
       return new Promise((resolve,reject)=>{
           cloudinary.uploader.upload_stream(
              {
                resource_type:"auto",
                public_id:`ZenithHealthcare/${folder}/${uniqueFilename}`,
                folder:`ZenithHealthcare/${folder}`,
                
              },
              (error,result)=>{
                  if(error){
                      reject(new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload file to cloudinary"))
                  }
                  resolve(result as UploadApiResponse)
              }
           ).end(buffer)
       })


}



export const deleteFileFromCloudinary = async (fileUrl: string) => {
    try {
        const regex = /\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/;
        const match = fileUrl.match(regex)
        if (match) {
            const publicId = match[1]
            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image"
            })

        }
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete file from cloudinary")
    }
}
export const cloudinaryConfig = cloudinary