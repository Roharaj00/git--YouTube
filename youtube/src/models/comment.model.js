import mongoose,{Schema} from "mongoose";
// import mongooseAggregatePaginate from "mongooseAggregatePaginate";//npm install mongoose-aggregate-paginate-v2

// comment model

const commentSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes:[{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    likesCount:{
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);
commentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
      this.likesCount = this.likes.length;
  }
  next();
})
// commentSchema.plugin(mongooseAggregatePaginate); // Enable pagination for the comments

export const  Comment = mongoose.model("Comment", commentSchema);
