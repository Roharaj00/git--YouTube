import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async(req,res)=>{
    // build a healthcheck response that simply returns the OK status as json with a message
    return res.status(200).json(new ApiResponse(200, "OK", "Health Check successful"));
    
})

export {healthCheck}