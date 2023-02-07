import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import multer from "multer";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/post.js";
import { createPost } from "./controllers/post.js";
import { register } from "./controllers/auth.js";
import { verifyToken } from "./middleware/auth.js";
// import User from "./models/User.js";
// import Post from "./models/Post.js";
// import {users , posts} from "./data/index.js";

///////////////////
// Configurations
//////////////////

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets" , express.static(path.join(__dirname , 'public/assets')));

//////////////////////
// File Storage Setup
//////////////////////

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/assets");
    },
    filename : function(req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

////////////////////////////
// Routes with file uploads
////////////////////////////

app.post("/auth/register" , upload.single("picture") , register);
app.post("/posts", verifyToken , upload.single("picture"), createPost)

///////////////
// Routes
///////////////

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/post", postRoutes);


//////////////////
// Mongoose 
/////////////////

const PORT = process.env.PORT || 4001 ;
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()  => {
    app.listen(PORT , () => {
        console.log(`Server running on port: ${PORT}`);
    });

    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((error) => console.log(`${error} did not connect`));
