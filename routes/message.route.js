import express from "express";
import { sendMessageController } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/token.middlewares.js";

const router = express.Router();

router.post("/", protectRoute, sendMessageController);

export default router;
