import express from 'express';
import { generateExpressEntryReport, generatePNPReport, generateRecommendationReport, generateReport, regenerateReport } from '../controllers/immigrationReportController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();


// router.get('/express-entry/:userId', generateExpressEntryReport);
// router.get('/pnp/:userId', generatePNPReport);
// router.get('/recommendations/:userId', generateRecommendationReport);

router.get('/generate/:userId',protect, generateReport);
router.get('/regenerate/:userId',protect, regenerateReport);



export default router;
