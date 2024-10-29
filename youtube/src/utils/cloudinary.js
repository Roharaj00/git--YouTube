import cloudinary, { v2 as cloudinary } from "cloudinary"; //npm i cloudinary
import fs from "fs";


 
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });

uploadOnCloudinary =async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        // upload the cloudinary  file locally
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto" 
        })
        // file is uploaded successfully
        console.log("file is uploaded successfully",response.url);
        return response;
    } catch (error) {
        // remove the lacally saved file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null;
        
    }
}

export {uploadOnCloudinary}
 