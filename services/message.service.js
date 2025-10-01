// services/message.service.js
import { db } from "../libs/firebase.js";
import Message from "../models/message.model.js";

export const sendMessageService = async ({ chatId, from, to, content }) => {
    if (!chatId || !from || !content) {
        throw new Error("chatId, from, and content are required");
    }

    const chatRef = db.collection("chats").doc(chatId);
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) throw new Error("Chat not found");

    const now = new Date();
    const message = new Message({
        chatId,
        from,
        to: to || null,
        content,
        timestamp: now,
        seen: false,
    });

    const messageRef = await db.collection("messages").add(message.toFirestore());
    await chatRef.update({ updatedAt: now });

    const savedMessage = { id: messageRef.id, ...message.toFirestore() };

    return savedMessage;
};

export const getMessagesByChatIdService = async (chatId, currentEmployeeId) => {
    try {
        // Lấy chat để biết participants
        const chatDoc = await db.collection("chats").doc(chatId).get();
        if (!chatDoc.exists) {
            throw new Error("Chat not found");
        }

        const { participants } = chatDoc.data();

        const snapshot = await db
            .collection("messages")
            .where("chatId", "==", chatId)
            .orderBy("timestamp", "asc")
            .get();

        const messages = snapshot.docs.map((doc) => {
            const data = doc.data();

            // xác định "to" = người còn lại ngoài currentEmployeeId
            const others = participants.filter((p) => p !== currentEmployeeId);
            return {
                id: doc.id,
                ...data,
                to: others.length === 1 ? others[0] : others, // chat 1-1 thì lấy 1 id, group chat thì trả array
            };
        });

        return messages;
    } catch (error) {
        throw new Error("Failed to get messages: " + error.message);
    }
};