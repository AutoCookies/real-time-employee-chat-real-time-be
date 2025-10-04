import { db } from '../libs/firebase.js'
import Chat from '../models/chat.model.js'

/**
 * This function is for crreate a new chat form list of participants and current user signin the system.
 * @param {string[]} participants - list of doc.id
 * @param {string} currentUserId - account doc.id of existed user
 * @returns {Promise<{id: string, name: string, participantsDetail: Array<{id:string, name:string}>}>}
 */
export const createChatService = async (participants, currentUserId) => {
    try {
        const now = new Date();

        // 1. Check If chat existed?
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

        // 2. Get Employee Details means informations
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

            // Put name, if has
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

        // 3. Create new chat object, with name null
        const newChat = new Chat({
            name: null,
            participants,
            createdAt: now,
            updatedAt: now,
        });

        const docRef = await db.collection("chats").add(newChat.toFirestore());
        const doc = await docRef.get();
        const chatData = { id: doc.id, ...doc.data() };

        const participantsDetail = await getParticipantsDetail(chatData.participants);

        // If name is null, get the participant names for Its name.
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

/**
 * This function is for delete a chat with id
 * @param {string} chatId id of chat
 * @returns sucess and message
 */
export const deleteChatService = async (chatId) => {
    try {
        const chatRef = db.collection("chats").doc(chatId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            throw new Error("Chat not found");
        }

        // Delete all messages related to chat
        const messagesSnap = await db
            .collection("messages")
            .where("chatId", "==", chatId)
            .get();

        const batch = db.batch();
        messagesSnap.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete chat
        batch.delete(chatRef);

        await batch.commit();

        return { success: true, message: "Chat deleted successfully" };
    } catch (error) {
        throw new Error("Failed to delete chat: " + error.message);
    }
};

/**
 * This function is for get all created chat of a user
 * @param {string} employeeId 
 * @returns list of chats
 */
export const getChatsByEmployeeIdService = async (employeeId) => {
    try {
        const snapshot = await db
            .collection("chats")
            .where("participants", "array-contains", employeeId)
            .get();

        const chats = [];

        // Get participants details function
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