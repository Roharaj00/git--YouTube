import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

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
    $or: [{ username }, { email }],
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
const LogOutUser = asyncHandler(async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      throw new ApiError("User not authenticated", 401);
    }

    console.log("Logging out user:", req.user._id);

    // Attempt to unset the refreshToken
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError("User not found", 404);
    }

    console.log("User updated:", updatedUser);

    const options = {
      httpOnly: true,
      secure: true,
    };

    console.log("Clearing cookies:", req.cookies);

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.error("Error in LogOutUser:", error.message);
    next(error);
  }
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError("unauthorized request");
  }
  //  verify incoming refresh token
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?.id);
    if (!user) {
      throw new ApiError("Iinvalid Refresh Token");
    }
    //  campare incomingrefreshtoken and refreshtoken
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError("Invalid Refresh Token");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    //  generate new access token and refresh token
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", options)
      .cookie("newRefreshToken", options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "User refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError("Error refreshing tokens" || error?.message, 500); // Return generic error message to the client for security reasons. You may want to return a more specific error message depending on the error type. For example, if the refresh token is expired, you could return "Refresh token expired".  If the refresh token is not valid, you could return "Invalid refresh token".  If the user is not found, you could return "User not found".  If the user is not authorized, you could return "Unauthorized request".  If the server is unable to verify the refresh token, you could return "Failed to verify refresh token".  If the server is unable to generate a new access token and refresh token, you could return "Failed to generate new tokens".  If the server is unable to save the user's refresh token, you could return "Failed to save refresh token".
  }
});

// for change current password

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword,confirmPassword } = req.body;

  if (!(currentPassword || newPassword)) {
    throw new ApiError("Current password and new password are required", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError("New password and confirm password do not match", 400);
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  if (!isPasswordCorrect) {
    throw new ApiError("Incorrect current password", 401);
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});


// current user

const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return res.status(200).json(new ApiResponse(200, user, "User information"));
});

// update account details

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, fullname } = req.body;

  if (!(username || email)) {
    throw new ApiError("Username and email are required", 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
        fullname,
      },
    },
    { new: true, validateBeforeSave: false }
  ).select("-password");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const updateAvatar = asyncHandler(async (req, res) => {
  
    // Check if user exists in request (assuming middleware sets this)
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Validate file exists in request
    const avatarLocalPath = req.file?.avatar?.[0]?.path || req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing");
    }

    // Get current user to find old avatar URL
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    // Upload new avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new ApiError(400, "Error while uploading avatar");
    }

  
    // Update user with new avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { avatar: avatar.url },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "Error while updating user");
    }
   

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"));
  
      
});
// update cover image files

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.coverImage?.[0]?.path|| req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError("Cover image is missing ", 400);
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage?.url) {
    throw new ApiError("Error uploading images to Cloudinary", 500);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true, validateBeforeSave: false }
  ).setOptions({ new: true, select: "-password" });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});
// get user  Channel profile

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError("Username is missing", 400);
  }

  // Convert username to lowercase for case-insensitive matching
  const lowercaseUsername = username.toLowerCase().trim();

  const channel = await User.aggregate([
    {
      $match: {
        username: lowercaseUsername,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedChannelCount: {
          $size: "$subscribed",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [
                { $toObjectId: req.user?._id }, // Convert string ID to ObjectId if needed
                "$subscribers.subscriber",
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        email: 1,
        username: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedChannelCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError("Channel not found", 404);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channel[0],
        "User channel profile fetched successfully"
      )
    );
});


// get watchHistory
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ])
  return res
   .status(200)
   .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});

export {
  registerUser,
  loginUser,
  LogOutUser,
  refreshAccessToken,
  changePassword,
  currentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
