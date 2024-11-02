import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import{Video} from "../models/video.model.js";
// import{Like} from "../models/like.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import mongoose from "mongoose";
// getChannelStats

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId  = req.user._id;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Get total subscribers count
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Get video stats: total videos, total views, and total likes
  const videos = await Video.find({ channel: channelId });
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);

  res.status(200).json(
    new ApiResponse(200, "Channel stats retrieved successfully", {
      totalSubscribers,
      totalVideos,
      totalViews,
      totalLikes,
    })
  );
});

// getChannelVideos

const getChannelVideos = asyncHandler(async (req, res) => {
  const  channelId = req.user.id;
  const { page = 1, limit = 10 } = req.query; // Optional pagination

  // Validate ObjectId
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Fetch videos with pagination
  const videos = await Video.find({ channel: channelId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // Sort by latest first

  res
    .status(200)
    .json(
      new ApiResponse(200, "Channel videos retrieved successfully", { videos })
    );
});

// export

export { getChannelStats, getChannelVideos };