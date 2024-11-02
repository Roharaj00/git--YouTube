import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideoDetails } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT)


router.route("/")
.get(getAllVideos)
.post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);
router
.route("/:id")
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"), updateVideoDetails)

router.route("toggle/publish/:videoId").patch(togglePublishStatus)


export  default router