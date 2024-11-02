import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribers, getSubscribedChannels, toggleSubscriptions } from "../controllers/subscription.controller.js";
const router = Router();
router.use(verifyJWT);

router.route("/c/:channelId").get(getSubscribedChannels)
.patch(toggleSubscriptions)
router.route("/u/:subcriberId").get(getChannelSubscribers)

export default router;
