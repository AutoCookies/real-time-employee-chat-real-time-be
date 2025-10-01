import {
    createChatService,
    deleteChatService,
    getChatsByEmployeeIdService
} from "../services/chat.service.js";

export const createChatController = async (req, res) => {
    try {
        const currentUserId = req.user.employeeId;
        const { otherId } = req.body; 

        if (!otherId) {
            return res.status(400).json({ error: "Other participant is required" });
        }

        if (currentUserId === otherId) {
            return res.status(400).json({ error: "Cannot create chat with yourself" });
        }

        const participants = [currentUserId, otherId];
        const result = await createChatService(participants, currentUserId);

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteChatController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Chat ID is required" });
        }

        const result = await deleteChatService(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getChatsByEmployeeIdController = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const result = await getChatsByEmployeeIdService(employeeId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};