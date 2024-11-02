import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";//npm install mongoose-aggregate-paginate-v2


const playlistSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
    description:{
        type: String,
        required: true,
    }
  
},{ timestamps: true });

// playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist", playlistSchema);
