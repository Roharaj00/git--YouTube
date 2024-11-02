import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";//npm install mongoose-aggregate-paginate-v2


const tweetSchema = new Schema(
  {
    // owner and content
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [], // Ensure `likes` is always initialized as an empty array
    },
  },
  { timestamps: true }
);

// Add pagination support

// tweetSchema.plugin(mongooseAggregatePaginate);

export const Tweet = mongoose.model("Tweet", tweetSchema);
