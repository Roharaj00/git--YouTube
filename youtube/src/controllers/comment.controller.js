import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import{Comment} from "../models/comment.model.js"
import mongoose from "mongoose";


// getVideoComments

const getVideoComments = asyncHandler(async (req, res) => {
  const videoId = req.params.id||req.video?.id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid video ID", 400);
  }

  const comments = await Comment.find({ video: videoId })

  return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved"));
});
// addComment

const addComment = asyncHandler(async (req, res) => {
  const videoId = req.params.id || req.video?.id;

  // Check if video ID is valid
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid video ID", 400);
  }

  const { content } = req.body;

  // Create the comment with owner, video ID, and content
  const comment = await Comment.create({
    owner: req.user.id,
    video: videoId,
    content: content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});
// updateComment

const updateComment = asyncHandler(async (req, res) => {
  // const videoId = req.params.id||req.video?.id;
  const commentId = req.params.id||req.comment?.id

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError("Invalid  comment ID", 400);
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set:{
      content: req.body.content
    }},
    { new: true }
  )

  if (!updatedComment) {
    throw new ApiError("Comment not found", 404);
  }

  return res
   .status(200)
   .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});
// deleteComment

const deleteComment = asyncHandler(async (req, res) => {
  
  const commentId = req.params.id||req.comment?.id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError("Invalid comment ID", 400);
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError("Comment not found", 404);
  }

  return res
   .status(200)
   .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});
// export all functions

export { getVideoComments, addComment, updateComment, deleteComment };

