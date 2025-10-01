
import { decodeAccessToken } from "../helpers/token.helper.js";
import { db } from "../libs/firebase.js";
import Log from "../models/log.model.js";
/**
 * Middleware cho REST API chat backend
 */
export const protectRoute = async (request, response, next) => {
    try {
        let token = request.cookies?.["accessToken"];

        if (!token && request.headers.authorization?.startsWith("Bearer")) {
            token = request.headers.authorization.split(" ")[1];
        }

        if (!token) {
            const log = new Log({
                action: "Permission denied! No access token provided.",
                timestamp: new Date(),
            });
            await db.collection("logs").add(log.toFirestore());

            return response
                .status(401)
                .json({ message: "Permission denied! Please log in to continue." });
        }

        // decode token
        const decoded = await decodeAccessToken(token);

        if (!decoded || !decoded.employeeId) {
            const log = new Log({
                action: "Invalid access token decode attempt in middleware (missing employeeId)",
                timestamp: new Date(),
            });
            await db.collection("logs").add(log.toFirestore());

            return response.status(401).json({ message: "Invalid or expired token" });
        }

        // lấy account bằng document id (employeeId)
        const docRef = db.collection("accounts").doc(decoded.employeeId);
        const doc = await docRef.get();

        if (!doc.exists) {
            const log = new Log({
                action: `User with employeeId ${decoded.employeeId} not found in database`,
                timestamp: new Date(),
            });
            await db.collection("logs").add(log.toFirestore());

            return response
                .status(401)
                .json({ message: "User not found. Please log in again!" });
        }

        // gắn user vào request
        request.user = {
            id: doc.id,
            ...doc.data(),
        };

        next();
    } catch (error) {
        console.error("ProtectRoute Error:", error);

        const log = new Log({
            action: `Error in protectRoute middleware: ${error.message}`,
            timestamp: new Date(),
        });
        await db.collection("logs").add(log.toFirestore());

        return response.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Middleware cho Socket.IO
 */
export const protectSocket = async (socket, next) => {
    try {
        let token = null;

        // lấy token từ cookie nếu có
        if (socket.handshake.headers.cookie) {
            const cookies = Object.fromEntries(
                socket.handshake.headers.cookie.split("; ").map(c => c.split("="))
            );
            token = cookies["accessToken"];
        }

        // fallback: lấy từ auth
        if (!token) token = socket.handshake.auth?.token;

        if (!token) return next(new Error("Authentication error: Token required"));

        const decoded = await decodeAccessToken(token);
        if (!decoded?.employeeId) return next(new Error("Authentication error: Invalid token"));

        socket.user = decoded;
        next();
    } catch (error) {
        console.error("protectSocket Error:", error);
        next(new Error("Internal server error"));
    }
};


