// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import ENVARS from "./libs/envvars.js";
import chatRoutes from './routes/chat.route.js'
import messageRoutes from './routes/message.route.js'
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

const io = new Server(server, {
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
    console.log(`User connected: ${socket.user.id}`);

    // join vào room riêng của user
    socket.join(socket.user.id);

    socket.on("chat:message", ({ to, content }) => {
        const msg = {
            from: socket.user.id,
            to,
            content,
            timestamp: new Date(),
        };

        io.to(socket.user.id).emit("chat:message", msg);

        io.to(to).emit("chat:message", msg);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.id}`);
    });
});


app.get("/", (req, res) => {
    res.send("Chat backend is running");
});

app.use("/chats", chatRoutes)
app.use('/message', messageRoutes)

server.listen(ENVARS.PORT, () => {
    console.log(`Chat backend listening on port ${ENVARS.PORT}`);
});
