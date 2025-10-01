// services/message.service.js
import { db } from "../libs/firebase.js";
import Message from "../models/message.model.js";

export const sendMessageService = async ({ chatId, from, to, content }) => {
    try {
        if (!chatId || !from || !to || !content) {
            throw new Error("chatId, from, to, and content are required");
        }

        // Kiểm tra chat có tồn tại không
        const chatRef = db.collection("chats").doc(chatId);
        const chatDoc = await chatRef.get();
        if (!chatDoc.exists) {
            throw new Error("Chat not found");
        }

        const now = new Date();

        // Tạo message
        const message = new Message({
            chatId,
            from,
            to,
            content,
            timestamp: now,
        });

        const messageRef = await db.collection("messages").add(message.toFirestore());

        // Cập nhật updatedAt của chat
        await chatRef.update({ updatedAt: now });

        return {
            id: messageRef.id,
            ...message.toFirestore(),
        };
    } catch (error) {
        throw new Error("Failed to send message: " + error.message);
    }
};
