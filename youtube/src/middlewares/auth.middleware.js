import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      console.error("No token found");
      throw new ApiError("Unauthorized request", 401);
    }

    console.log("Token being verified:", token);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decodedToken);

    // Change this line to use `id` instead of `_id`
    if (!decodedToken?.id) {
      console.error("Decoded token does not contain an ID");
      throw new ApiError("Invalid access token", 401);
    }

    const user = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.error("User not found for ID:", decodedToken.id);
      throw new ApiError("Invalid access token", 401);
    }

    req.user = user;
    next()
  } catch (error) {
    console.error("Error in verifyJWT:", error.message);
    next(new ApiError(error.message || "Invalid access token", 401));
  }

  
});





