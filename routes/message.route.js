import express from "express";
import { 
    sendMessageController,
    getMessagesByChatIdController
 } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/token.middlewares.js";

const router = express.Router();

router.post("/", protectRoute, sendMessageController);
router.post("/all", protectRoute, getMessagesByChatIdController);

export default router;
