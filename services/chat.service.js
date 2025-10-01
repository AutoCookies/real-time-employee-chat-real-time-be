import { db } from '../libs/firebase.js'
import Chat from '../models/chat.model.js'

/**
 * Tạo chat mới hoặc trả về chat đã tồn tại giữa các participants
 * @param {string[]} participants - danh sách account doc.id
 * @param {string} currentUserId - account doc.id của user hiện tại
 * @returns {Promise<{id: string, name: string, participantsDetail: Array<{id:string, name:string}>}>}
 */
export const createChatService = async (participants, currentUserId) => {
    try {
        const now = new Date();

        // 1. Kiểm tra chat đã tồn tại chưa
        const snapshot = await db
            .collection("chats")
            .where("participants", "array-contains", participants[0])
            .get();

        let existingChat = null;
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (
                data.participants.length === participants.length &&
                participants.every((p) => data.participants.includes(p))
            ) {
                existingChat = { id: doc.id, ...data };
            }
        });

        // 2. Lấy chi tiết participants (tên employee)
        const getParticipantsDetail = async (participantIds) => {
            return Promise.all(
                participantIds.map(async (accountId) => {
                    const accountDoc = await db.collection("accounts").doc(accountId).get();
                    if (!accountDoc.exists) return { id: accountId, name: "Unknown" };

                    const employeeId = accountDoc.data().employeeId;
                    const employeeDoc = await db.collection("employees").doc(employeeId).get();

                    return {
                        id: accountId,
                        name: employeeDoc.exists ? employeeDoc.data().name : "Unknown",
                    };
                })
            );
        };

        if (existingChat) {
            const participantsDetail = await getParticipantsDetail(existingChat.participants);

            // Tự đặt name nếu null
            const chatName =
                existingChat.name ||
                participantsDetail
                    .filter((p) => p.id !== currentUserId)
                    .map((p) => p.name)
                    .join(", ");

            return {
                id: existingChat.id,
                name: chatName,
                participantsDetail,
            };
        }

        // 3. Tạo chat mới
        const newChat = new Chat({
            name: null, // name sẽ tự tạo sau
            participants,
            createdAt: now,
            updatedAt: now,
        });

        const docRef = await db.collection("chats").add(newChat.toFirestore());
        const doc = await docRef.get();
        const chatData = { id: doc.id, ...doc.data() };

        const participantsDetail = await getParticipantsDetail(chatData.participants);

        // Tự đặt name nếu null: tên các participants khác currentUserId
        const chatName =
            chatData.name ||
            participantsDetail
                .filter((p) => p.id !== currentUserId)
                .map((p) => p.name)
                .join(", ");

        return {
            id: chatData.id,
            name: chatName,
            participantsDetail,
        };
    } catch (error) {
        throw new Error("Failed to create chat: " + error.message);
    }
};

export const deleteChatService = async (chatId) => {
    try {
        const chatRef = db.collection("chats").doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            throw new Error("Chat not found");
        }

        // Xoá tất cả messages liên quan
        const messagesSnap = await db
            .collection("messages")
            .where("chatId", "==", chatId)
            .get();

        const batch = db.batch();
        messagesSnap.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Xoá luôn chat
        batch.delete(chatRef);

        await batch.commit();

        return { success: true, message: "Chat deleted successfully" };
    } catch (error) {
        throw new Error("Failed to delete chat: " + error.message);
    }
};

export const getChatsByEmployeeIdService = async (employeeId) => {
    try {
        const snapshot = await db
            .collection("chats")
            .where("participants", "array-contains", employeeId)
            .get();

        const chats = [];

        // Hàm phụ lấy participant details trực tiếp từ employeeId
        const getParticipantsDetail = async (participantIds) => {
            return Promise.all(
                participantIds.map(async (empId) => {
                    const employeeDoc = await db.collection("employees").doc(empId).get();
                    return {
                        id: empId,
                        name: employeeDoc.exists ? employeeDoc.data().name : "Unknown",
                    };
                })
            );
        };

        for (const doc of snapshot.docs) {
            const chat = Chat.fromFirestore(doc);
            if (chat) {
                const participantsDetail = await getParticipantsDetail(chat.participants);
                const chatName = chat.name || participantsDetail
                    .filter(p => p.id !== employeeId)
                    .map(p => p.name)
                    .join(", ");

                chats.push({
                    id: doc.id,
                    name: chatName,
                    participantsDetail,
                });
            }
        }

        return chats;
    } catch (error) {
        throw new Error("Failed to fetch chats: " + error.message);
    }
};