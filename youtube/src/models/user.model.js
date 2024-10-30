import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";//npm i jsonwebtoken
import bcrypt from "bcrypt";//npm i bcrypt

const userSchema = new Schema(
  {
    username: { 
        type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         index: true
        },
        
    email: { 
        type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
         
        },
    fullname: { 
         type: String,
         required: true,
         trim: true,
         index: true
        },
    avatar:{ 
        type: String,
        required: true
        },
    coverImage: {
        type:String
        },

    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref:"Video"

    }],
    password: {
        type:String,
        required: [true,'Password is required'],
        minlength: 8,
    },
    refreshToken:{
        type: String,
    }


  },
  { timestamps: true }
);
//logic of password encrypting...
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})
//isPasswordCorrect method is use for password checking...
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}
//Token generation by using jwt token
//jwt.sign() method is use for token generating...
//generateRefreshToken method is used for generate Refresh token generation...
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
,
      }
    );
}
userSchema.methods.generateRefreshToken = async function(){
      return jwt.sign(
        {
          id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
      );
}

export const User = mongoose.model("User", userSchema);
