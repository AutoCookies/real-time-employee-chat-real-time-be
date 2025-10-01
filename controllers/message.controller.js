// controllers/message.controller.js
import { sendMessageService } from "../services/message.service.js";

export const sendMessageController = async (req, res) => {
    try {
        const { chatId, from, to, content } = req.body;

        const result = await sendMessageService({ chatId, from, to, content });

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
