const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");
const groupRoutes = require("./routes/groups");
const authMiddleware = require("./middleware/authMiddleware");
const Message = require("./models/Message");
const User = require("./models/User");

const app = express();
dotenv.config();
connectDB();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let onlineUsers = new Map();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/groups", groupRoutes);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("register_online", (token) => {
    try {
      const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
      onlineUsers.set(decoded.id, socket.id);
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    } catch {}
  });

  socket.on("join_room", async (room) => {
    socket.join(room);
    const messages = await Message.find({ room });
    socket.emit("load_messages", messages);
  });

  socket.on("send_message", async (data) => {
    const newMsg = new Message(data);
    await newMsg.save();
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("user_typing", { username });
  });

  socket.on("get_user_status", async (userId, callback) => {
    if (onlineUsers.has(userId)) return callback({ status: "Online" });

    const user = await User.findById(userId);
    if (!user) return callback({ status: "Unknown" });

    const lastSeen = new Date(user.lastSeen).toLocaleString();
    callback({ status: `Last seen: ${lastSeen}` });
  });

  socket.on("disconnect", async () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        await User.findByIdAndUpdate(uid, { lastSeen: new Date() });
        onlineUsers.delete(uid);
        io.emit("update_online_users", Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log("User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
