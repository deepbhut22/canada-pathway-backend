import express from 'express';
import { addMessage, getChatHistory } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:userId', protect, getChatHistory);
router.post('/:userId', protect, addMessage);

export default router;
