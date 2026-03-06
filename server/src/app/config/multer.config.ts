import { cloudinaryConfig } from "./cloudinary.config";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage=new CloudinaryStorage({
    cloudinary:cloudinaryConfig,
    params:async (req,file)=>{
        const orginalName=file.originalname
       const fileExtension=orginalName.split(".").pop()?.toLowerCase();
       const filenameWithoutExtension=orginalName.split(".")
       .splice(0,-1).join(".").toLowerCase().replace(/\s/g,"-")
       .replace(/[^a-z0-9-]/g,"")

       const uniqueFilename=Math.random().toString(36).substring(2)+
       "-"+Date.now()+
       "-"+filenameWithoutExtension
       const folder=fileExtension==="pdf"?"pdfs":"images"
       return{
        folder:`ZenithHealthcare/${folder}`,
        public_id:uniqueFilename,
        resource_type:"auto"
       }
      
    }
})

export const multerUpload=multer({storage})