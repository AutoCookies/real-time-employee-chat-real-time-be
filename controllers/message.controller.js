// controllers/message.controller.js
import {
    sendMessageService,
    getMessagesByChatIdService
} from "../services/message.service.js";
import { io } from '../server.js'

export const sendMessageController = async (req, res) => {
    try {
        const from = req.user.employeeId;
        // console.log(`CUrrent user: ${from}`)
        const { chatId, to, content } = req.body;

        const result = await sendMessageService({ chatId, from, to, content });

        if (chatId) io.to(chatId).emit("newMessage", result);
        if (to) {
            io.to(to).emit("newMessage", result);
            io.to(from).emit("newMessage", result);
        }

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getMessagesByChatIdController = async (req, res) => {
    try {
        const { chatId } = req.body;
        const currentEmployeeId = req.user.employeeId

        if (!chatId) {
            return res.status(400).json({ error: "chatId is required" });
        }

        const messages = await getMessagesByChatIdService(chatId, currentEmployeeId);
        return res.status(200).json(messages);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};