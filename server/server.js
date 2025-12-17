import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";

// ----------------------------
// Create Express App & HTTP Server
// ----------------------------
const app = express();
const server = http.createServer(app);

// ----------------------------
// Middleware
// ----------------------------
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: "4mb" }));

// ----------------------------
// Initialize Socket.io
// ----------------------------
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store online users (userId -> socketId)
export const userSocketMap = {};

// ----------------------------
// Socket.io Connection
// ----------------------------
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("Socket connected:", socket.id, "User:", userId);

  // Save user socket
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Send online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id, "User:", userId);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ----------------------------
// Routes
// ----------------------------
app.get("/api/status", (req, res) => {
  res.send("Server is Running");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ----------------------------
// Connect DB & Start Server
// ----------------------------
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on PORT: ${PORT}`);
});
