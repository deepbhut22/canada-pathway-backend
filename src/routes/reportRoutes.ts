import express from 'express';
import { generateExpressEntryReport, generatePNPReport, generateRecommendationReport } from '../controllers/immigrationReportController';

const router = express.Router();

router.get('/express-entry/:userId', generateExpressEntryReport);
router.get('/pnp/:userId', generatePNPReport);
router.get('/recommendations/:userId', generateRecommendationReport);



export default router;
