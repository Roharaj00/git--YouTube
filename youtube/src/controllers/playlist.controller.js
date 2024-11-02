import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose,{isValidObjectId} from "mongoose";




const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // create playlist
  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: [],
  });
  if (!newPlaylist){
    throw new ApiError("Failed to create playlist", 500);
  }
  // save playlist
  await newPlaylist.save();
  res.status(201).json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));

  
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // get user playlists
  const userPlaylists = await Playlist.find({ owner: userId });
  if (!userPlaylists){
    throw new ApiError("Failed to get user playlists", 500);
  }
  res.status(200).json(new ApiResponse(200, userPlaylists, "User playlists retrieved successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // get playlist by id
  if (!isValidObjectId(playlistId)){
    throw new ApiError("Invalid playlist ID", 400);
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist){
    throw new ApiError("Failed to get playlist", 404);
  }
  res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // add video to playlist
  if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)){
    throw new ApiError("Invalid playlist or video ID", 400);
  }
  const playlist = await Playlist.findByIdAndUpdate(playlistId, { $push: { videos: videoId } }, { new: true });
  if (!playlist){
    throw new ApiError("Failed to add video to playlist", 500);
  }
  res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // remove video from playlist
  if (!isValidObjectId(playlistId) ||!isValidObjectId(videoId)){
    throw new ApiError("Invalid playlist or video ID", 400);
  }
  const playlist = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true });
  if (!playlist){
    throw new ApiError("Failed to remove video from playlist", 500);
  }
  res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // delete playlist
  if (!isValidObjectId(playlistId)){
    throw new ApiError("Invalid playlist ID", 400);
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist){
    throw new ApiError("Failed to delete playlist", 500);
  }
  res.status(200).json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //update playlist
  if (!isValidObjectId(playlistId)){
    throw new ApiError("Invalid playlist ID", 400);
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, { name, description }, { new: true });
  if (!updatedPlaylist){
    throw new ApiError("Failed to update playlist", 500);
  }
  res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
