import express from "express"; //npm i express
import cors from "cors"; // npm i cors
import cookieParser from "cookie-Parser"; // npm i cookieParser

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("./public"));
app.use(cookieParser());

//routes imports
import UserRouter from "./routes/user.routes.js";
import VideoRouter from "./routes/video.routes.js";
import CommentRouter from "./routes/comment.routes.js";
import DashbordRouter from "./routes/dashboard.routes.js";
import TweetRouter from "./routes/tweet.routes.js";
import SubscriptionRouter from "./routes/subscription.routes.js";
import PlaylistRouter from "./routes/playlist.routes.js"
import HealthcheckRouter from "./routes/healthcheck.routes.js";
import LikeRouter from "./routes/like.routes.js";




// routes declaration
app.use("/api/v1/users", UserRouter);
app.use("/api/v1/videos", VideoRouter);
app.use("/api/v1/comments", CommentRouter);
app.use("/api/v1/dashboards", DashbordRouter);
app.use("/api/v1/tweets", TweetRouter);
app.use("/api/v1/subscriptions", SubscriptionRouter);
app.use("/api/v1/playlists", PlaylistRouter);
app.use("/api/v1/healthchecks", HealthcheckRouter);
app.use("/api/v1/likes", LikeRouter);

export { app };
