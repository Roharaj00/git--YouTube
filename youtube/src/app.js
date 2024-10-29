import express from 'express';//npm i express
import cors from 'cors'; // npm i cors
import cookieParser from 'cookie-Parser'; // npm i cookieParser

const app = express();


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true,limit:"16kb"}));
app.use(express.static("./public"))
app.use(cookieParser())

//routes imports
import UserRouter from "./routes/user.routes.js";


// routes declaration
app.use('/api/v1/users', UserRouter);

export { app };