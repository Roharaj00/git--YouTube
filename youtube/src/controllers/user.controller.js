import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/uploadOnCloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser =asyncHandler( async(req, res)=>{
    // res.status(200).json({message:"User registered"});
const {fullname, email, password,username} =req.body;
console.log("email: " + email)


// checking for client fill all fields or not
if([username, password, fullname, email].some((field)=>
field?.trim()==="")){
    throw new ApiError("All fields are required", 400);
}
// ckecking user is already registered or not registered

const existedUser = await User.findOne({$or:[{username}, {email}]});

if(user){
    throw new ApiError("User already registered", 409);
}
// 
const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

// check avatarfile exists or not
 if(!avatarLocalPath){
    throw new ApiError("Avatar is required", 400);
 }
//  upload files in Cloudinary

const avatar= await uploadOnCloudinary(avatarLocalPath, "avatar");
const coverImage= await uploadOnCloudinary(coverImageLocalPath, "cover");

// check avater is upload or not

if(!avatar){
    throw new ApiError("avatar is required", 400);
}
// crate user object - create entry in db

const user =await User.create({
    username: username.toLowerCase(),
    password,
    fullname,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
})

// checking User is successfully created
//hide user password and refreshToken from the db
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
 if (!createdUser){
    throw new ApiError("User not created", 500);
 }
//  if User is created successfully send a response
return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)






})



export {registerUser}