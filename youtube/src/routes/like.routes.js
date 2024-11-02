import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";
const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").patch(toggleVideoLike)
router.route("/toggle/c/:commentId").patch(toggleCommentLike)
router.route("/toggle/t/:tweetId").patch(toggleTweetLike)
router.route("/videos").get(getAllLikedVideos)

export default router;
