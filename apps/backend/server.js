import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import { Server } from "socket.io";

dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app)

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinGroup", (groupId) => {
        socket.join(`group_${groupId}`);
        console.log(`User joined group: group_${groupId}`);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"]
}));


// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRoutes);


// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}

// Export server for Vercel
export default server;
