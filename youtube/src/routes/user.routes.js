import { Router } from "express";
import { changePassword,
         currentUser,
         getUserChannelProfile, 
         getWatchHistory, 
         loginUser, 
         LogOutUser, 
         refreshAccessToken, 
         registerUser, 
         updateAccountDetails, 
         uptadeAvatar, 
         uptadeCoverImage 
        } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser)


// secured route
router.route("/logout").post(verifyJWT,LogOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, currentUser);
router.route("/update-details").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),uptadeAvatar);
router.route("/update-cover").patch(verifyJWT,upload.single("coverImage"),uptadeCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory);


export default router
