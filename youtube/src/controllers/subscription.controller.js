import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import{ Subscription}from "../models/subscriptions.model.js";
import mongoose from "mongoose";
const {isValidObjectId} = mongoose;



// create channel
// toggle subscriptions

const toggleSubscriptions = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id; // Assuming the user is authenticated

  // Validate ObjectIds
  if (!isValidObjectId(channelId) || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid channel or subscriber ID");
  }

  // Check if the subscription already exists
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });

  let message;
  if (existingSubscription) {
    // Unsubscribe the user
    await Subscription.deleteOne({ _id: existingSubscription._id });
    message = "Unsubscribed successfully";
  } else {
    // Subscribe the user
    await Subscription.create({ channel: channelId, subscriber: subscriberId });
    message = "Subscribed successfully";
  }

  res.status(200).json(new ApiResponse(200, message));
});
// controller to return subscriber list of channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  // Validate ObjectId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Find all subscriptions for the channel
  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "name email"
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers retrieved successfully", {
        subscribers,
      })
    );
});

// controller to return channel list to which channel has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id; // Assuming the user is authenticated

  // Validate ObjectId
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  // Find all subscriptions for the user
  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "name description");

  res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribed channels retrieved successfully", {
        subscriptions,
      })
    );
});
// export all functions

export { toggleSubscriptions, getChannelSubscribers, getSubscribedChannels };


