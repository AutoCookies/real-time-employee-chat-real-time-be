import express from "express";
import { 
    createChatController,
    deleteChatController,
    getChatsByEmployeeIdController
 } from "../controllers/chat.controller.js";
 import { protectRoute } from "../middlewares/token.middlewares.js";

const router = express.Router();

router.post("/", protectRoute, createChatController);
router.delete("/:id", protectRoute, deleteChatController);
router.get("/all", protectRoute, getChatsByEmployeeIdController);

export default router;
