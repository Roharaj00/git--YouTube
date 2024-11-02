import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
// import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

import { Video } from "../models/video.model.js";
// import{Like} from "../models/like.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params || req.video?.id;
  const userId = req.user._id; // Assuming user is authenticated

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const userLikedIndex = video.likes.indexOf(userId);
  let updateOperation;
  let message;

  if (userLikedIndex === -1) {
    updateOperation = { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };
    message = "Video liked successfully";
  } else {
    updateOperation = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
    message = "Video unliked successfully";
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateOperation, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        video: {
          _id: updatedVideo._id,
          likesCount: updatedVideo.likesCount,
        },
      },
      message
    )
  );
});



    // toggle tweet like
    const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params || req.tweet?.id;
    const userId = req.user._id; // Assuming user is authenticated
    
    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    
const userLikedIndex = Array.isArray(tweet.likes)
  ? tweet.likes.indexOf(userId)
  : -1;
    let updateOperation;
    let message;
    
    if (userLikedIndex === -1) {
        updateOperation = { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };
        message = "Tweet liked successfully";
      } else {
        updateOperation = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
        message = "Tweet unliked successfully";
      }
      
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, updateOperation, {
        new: true,
        runValidators: true,
      });
      
    return res.status(200).json(
        new ApiResponse(
          200,
          {
            tweet: {
              _id: updatedTweet._id,
              likesCount: updatedTweet.likesCount,
            },
          },
          message
        )
      );
    })
    // toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params || req.comment?.id;
  const userId = req.user._id; // Assuming user is authenticated

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userLikedIndex = Array.isArray(comment.likes)
    ? comment.likes.indexOf(userId)
    : -1;

  let updateOperation;
  let message;

  if (userLikedIndex === -1) {
    updateOperation = { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };
    message = "Comment liked successfully";
  } else {
    updateOperation = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
    message = "Comment unliked successfully";
  }

  // Execute the update operation and retrieve the updated comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    updateOperation,
    { new: true }
  );

 return res
 .status(200).json(
    new ApiResponse(
      200,
      {
        comment: {
          _id: updatedComment._id,
          likesCount: updatedComment.likesCount,
        },
      },
      "Comment updated successfully"
    ))
});

// get all liked videos

const getAllLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming user is authenticated

  const likedVideos = await Video.find({ likes: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      likedVideos,
      "All liked videos retrieved successfully"
    )
  );
});


export { toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideos 
}