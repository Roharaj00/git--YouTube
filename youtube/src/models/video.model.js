import mongoose,{Schema}from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";//npm install mongoose-aggregate-paginate-v2


const videoSchema = new Schema({
    videoFile:{
        type: String,//cloudnary url
        required: true
    },
    thumbnail:{
        type: String, //cloudnary url
        required: true
    },
    title:{
        type: String,//cloudnary url
        required: true
    },
    description:{
        type: String, 
        required: true
    },
    duration:{
        type: Number,//cloudnary url,
        // required: true
    },
    view:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    likesCount:{
        type: Number,
        default: 0
    },
    // commentLikes:[{
    //     type: Schema.Types.ObjectId,
    //     ref: "User"
    // }]
    
    
}, { timestamps: true });
videoSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
      this.likesCount = this.likes.length;
  }
  next();
});

// videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
