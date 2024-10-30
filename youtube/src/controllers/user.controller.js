import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    console.log("User found:", user); // Debugging log

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    console.log("Tokens generated successfully:", {
      accessToken,
      refreshToken,
    }); // Debugging log

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessTokenAndRefreshToken:", error); // Detailed error log
    throw new ApiError("Error generating tokens", 500);
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;

  if (
    [username, password, fullname, email].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("All fields are required", 400);
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError("User already registered", 409);
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
  }

  let avatar, coverImage;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }
  } catch (error) {
    throw new ApiError("Error uploading images to Cloudinary", 500);
  }

  if (!avatar) {
    throw new ApiError("Error uploading avatar", 500);
  }

  const user = await User.create({
    username: username.toLowerCase(),
    password,
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError("Error while registering user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // check  user is exist in database or not by id
  // email,username is match then match password
  // if password is not match and username and email is exist then show message incorrect password
  // if user is loged in
  // create middleware to authenticate the token
  // generate jwt token and refresh token
  // if token is matched stay logedin
  const { email, password, username } = req.body;

  if (!(email || username)) {
    throw new ApiError("username and pasword is required", 400);
  }

  const user = await User.findOne({
    $or:[{username},{email}],
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError("Incorrect password", 401);
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password, -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    ); 
    
  }); 
 const LogOutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
     req.user._id,
     {
       $set: {
         refreshToken: undefined,
       },
     },
     { new: true }
   );

   const options = {
     httpOnly: true,
     secure: true,
   };

   return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, null, "User logged out successfully"));
 });


export { registerUser, loginUser, LogOutUser };
