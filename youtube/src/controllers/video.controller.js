import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { User } from "../models/user.model.js";
// import jwt from "jsonwebtoken";
import{ Video} from "../models/video.model.js";
// import ffmpeg from "fluent-ffmpeg";

// import{ User } from "../models/user.model.js"




const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.user) {
    throw new ApiError("Login is required", 401);
  }

  if (!title || !description) {
    throw new ApiError("Title and description are required", 400);
  }

  const videoLocalPath = req.file?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError("Video file is required", 400);
  }

  const thumbnailLocalPath = req.file?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError("Thumbnail file is required", 400);
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoLocalPath);

  // Extract duration
//   const videoDuration = await getVideoDuration(videoLocalPath);

  const video = await Video.create({
    videoFile: videoFile.url,
    title,
    description,
    thumbnail: thumbnail.url,
    userId: req.user._id,
    owner: req.user._id,
    // duration: videoDuration,
  });

  res.status(201).json({
    success: true,
    data: video,
    message: "Video published successfully",
  });
});

// Helper function to get video duration using ffprobe
// function getVideoDuration(filePath) {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) {
//         reject(new ApiError("Could not retrieve video duration", 500));
//       } else {
//         resolve(metadata.format.duration); // Duration in seconds
//       }
//     });
//   });
// }


const getVideoById = asyncHandler(async (req, res) => {
  const videoId = req.params.id || req.body.video?.id;

  console.log("Fetching video with ID:", videoId);

  if (!videoId) {
    throw new ApiError("Video ID is required", 400);
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError("Video not found", 404);
  }

  res.status(200).json(new ApiResponse(200, video, "Video information"));
});




const getAllVideos = asyncHandler(async (req, res) => {
  const {page =1,limit =10,query,sortBy,sortType,userId} = req.query
//   get all videos based on query ,sort,pagination
  let videos;
  if(userId){
    videos = await Video.find({userId})
  }else{
    videos = await Video.find({}).skip((page - 1) * limit).limit(parseInt(limit))
  }
  if(query){
    videos = videos.filter(video=>video.title.toLowerCase().includes(query.toLowerCase()) || video.description.toLowerCase().includes(query.toLowerCase()))
  }
  if(sortBy && sortType){
    videos = videos.sort({[sortBy]:sortType === 'asc'? 1 : -1})
  }
  res.status(200).json({
    success: true,
    count: videos.length,
    data: videos,
  });
  const totalPages = Math.ceil(await Video.countDocuments().exec() / limit);
  res.header("Total-Pages", totalPages);
  res.header("Page", page);
  res.header("Limit", limit);
  res.header("X-Total-Count", await Video.countDocuments().exec());
  res.header("X-Current-Page", page);
  res.header("X-Total-Count", await Video.countDocuments().exec());
});

// update video details like title,description and thumbnail

const updateVideoDetails = asyncHandler(async (req, res) => {
   const videoId = req.params.id || req.body.video?.id;
   if(!videoId) {
     throw new ApiError("Video ID is required", 400);
   }
   const currentVideo = await Video.findById(videoId);
   if(!currentVideo){
     throw new ApiError("Video not found", 404);
   }
    const thumbnailLocalPath = req.file?.thumbnail?.[0]?.path || req.file?.path
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail?.url) {
      throw new ApiError("Error while uploading thumbnail", 400);
    }


   const video =await Video.findByIdAndUpdate(videoId,
    {
    $set:{
      title:
      req.body.title || currentVideo.title,
      description:
      req.body.description || currentVideo.description,
      thumbnail:thumbnail.url
    }
    },
    {new:true,validateBeforeSave:false}
   )
   if(!video){
     throw new ApiError("Failed to update video", 500);
   }
   return res
   .status(200)
   .json(new ApiResponse(200,video,"video details updated successfully"));

});

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.id || req.body.video?.id;

  console.log("Fetching video with ID:", videoId);

  if (!videoId) {
    throw new ApiError("Video ID is required", 400);
  }


  const RemoveVideo = await Video.findByIdAndDelete(videoId);
  if (!RemoveVideo) {
    throw new ApiError("Video not found", 404);
  }
  
  return res
   .status(200)
   .json(new ApiResponse(200,{},"video deleted successfully"))

  
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError("Video not found", 404);
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError("Not authorized to change publish status", 403);
  }

  video.isPublished = !video.isPublished;
  await video.save();

  res.status(200).json({
    success: true,
    data: video,
    message: `Video ${video.isPublished ? "published" : "unpublished"} successfully`,
  });
});







// export all functions

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
};