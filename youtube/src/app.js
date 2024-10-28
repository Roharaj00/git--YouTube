import express from 'express';//npm i express
import cors from 'cors'; // npm i cors
import cookieParser from 'cookie-parser';//npm i cookie-parser

const app = express();


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true,limit:"16kb"}));
app.use(express.static("./public"))
app.use(express.cookieParser())

export { app };