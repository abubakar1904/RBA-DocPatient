//importing libraries
import express from "express";              //main structure of express includes middleware and routing.
import cors from "cors";                    //Middleware is essentially functions and methods that get executed sequentially
import dotenv from "dotenv"                 //Routing is more of how your response cycle works, how your app responds to client req
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import webhookRouter from "./routes/webhook.js";

dotenv.config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api", webhookRouter);

// serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routing
app.get("/", (req, res) => {
    res.send("Server ok");
});

//testing get
app.get("/api", (req, res) => {
    res.json({message: "hello from server"})
});

//testing post
app.post("/api/user", (req, res) => {
    const {name, email} = req.body;
    res.json({success: true, name, email})
});

connectDB();

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));