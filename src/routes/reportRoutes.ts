import express from 'express';
import { generateExpressEntryReport, generatePNPReport } from '../controllers/immigrationReportController';

const router = express.Router();

router.get('/express-entry/:userId', generateExpressEntryReport);
router.get('/pnp/:userId', generatePNPReport);



export default router;
