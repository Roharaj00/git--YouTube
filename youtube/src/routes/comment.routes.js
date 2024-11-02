import { Router } from "express";
import { verifyJWT} from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);


router.route("/:id").get(getVideoComments)
.post(addComment)
router.route("/c/:id").patch(updateComment)
.delete(deleteComment)



export default router;
