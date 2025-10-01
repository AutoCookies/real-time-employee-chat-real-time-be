
import { decodeAccessToken } from "../helpers/token.helper.js";

/**
 * Middleware cho REST API chat backend
 */
export const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies?.["accessToken"];

        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Permission denied! Token required" });
        }

        const decoded = await decodeAccessToken(token);

        if (!decoded?.employeeId) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Gắn user vào request
        req.user = decoded;

        next();
    } catch (error) {
        console.error("protectRoute Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Middleware cho Socket.IO
 */
export const protectSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication error: Token required"));

        const decoded = await decodeAccessToken(token);
        if (!decoded?.employeeId) return next(new Error("Authentication error: Invalid token"));

        socket.user = decoded; // gắn thông tin user
        next();
    } catch (error) {
        console.error("protectSocket Error:", error);
        next(new Error("Internal server error"));
    }
};
