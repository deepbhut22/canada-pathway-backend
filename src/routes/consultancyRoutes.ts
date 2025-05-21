import { Router } from 'express';
import { getConsultancy } from '../controllers/consultancyController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/:userId', protect, getConsultancy);

export default router;


