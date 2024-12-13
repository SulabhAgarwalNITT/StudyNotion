import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"; // important to import dotenv whevever we have to use it
dotenv.config(); 

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File uploaded on cloudinary successfully, " , response.url)
        fs.unlinkSync(localFilePath);
        return response;
    }catch(err){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log("temporary file is removed from storage, but failed in uploading on cloudinary");
        return null;
    }
}