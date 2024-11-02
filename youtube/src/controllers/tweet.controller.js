import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    throw new ApiError(
      "Content is required and must be a non-empty string",
      400
    );
  }

  if (!req.user || !req.user._id) {
    throw new ApiError("User authentication required", 401);
  }

  const tweet = new Tweet({ content: content.trim(), owner: req.user._id });

  try {
    await tweet.save();
    return res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet created successfully"));
  } catch (error) {
    console.error("Error creating tweet:", error);
    if (error.name === "ValidationError") {
      throw new ApiError(error.message, 400);
    }
    throw new ApiError("Failed to create tweet. Please try again later.", 500);
  }
});
// getusertweet

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params||req.user?._id;

   if (!userId) {
    throw new ApiError("User ID is required", 400);
  }

  try {
    const tweets = await Tweet.find({ owner: userId }).select("-_id -owner")
    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    throw new ApiError("Failed to fetch user tweets. Please try again later.", 500);
  }
});



// update tweet

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError("Content is required", 400);
  }

  try {
    const tweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true });

    if (!tweet) {
      throw new ApiError("Tweet not found", 404);
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError("Failed to update tweet", 500);
  }
});

// delete tweet

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  try {
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
      throw new ApiError("Tweet not found", 404);
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError("Failed to delete tweet", 500);
  }
});

export{createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet

}