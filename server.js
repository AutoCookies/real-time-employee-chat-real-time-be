// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import ENVARS from "./libs/envvars.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import { db } from "./libs/firebase.js";
import { sendMessageService } from "./services/message.service.js";
const app = express();
const server = http.createServer(app);

// Middleware express
app.use(
    cors({
        origin: ENVARS.FE_URL,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

// Socket.IO
export const io = new Server(server, {
    cors: {
        origin: [ENVARS.FE_URL],
        credentials: true,
    },
});

const verifyToken = (token) => {
    try {
        return jwt.verify(token, ENVARS.JWT_ACCESS_SECRET);
    } catch (err) {
        return null;
    }
};

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Authentication error: Token required"));
    }

    const user = verifyToken(token);
    if (!user) {
        return next(new Error("Authentication error: Invalid token"));
    }

    socket.user = user;
    next();
});

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinRoom", async (chatId, callback) => {
        socket.join(chatId);

        // Lấy messages cũ
        const snapshot = await db
            .collection("messages")
            .where("chatId", "==", chatId)
            .orderBy("timestamp", "asc")
            .get();

        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (callback) callback(messages); // gửi về client khi join
    });

    socket.on("leaveRoom", (chatId) => {
        socket.leave(chatId);
    });

    socket.on("sendMessage", async ({ chatId, content }, callback) => {
        try {
            const from = socket.user.employeeId;

            // Lưu message vào DB và đồng thời nhận object message đã lưu
            const savedMessage = await sendMessageService({ chatId, from, content });

            // Emit realtime cho tất cả client trong room
            io.to(chatId).emit("newMessage", savedMessage);

            if (callback) callback({ success: true, message: savedMessage });
        } catch (err) {
            if (callback) callback({ success: false, error: err.message });
        }
    });
});

// Routes REST API
app.get("/", (req, res) => {
    res.send("Chat backend is running");
});

app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

// Start server
server.listen(ENVARS.PORT, () => {
    console.log(`🚀 Chat backend listening on port ${ENVARS.PORT}`);
});
