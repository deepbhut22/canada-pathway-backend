import Router from 'express';
import { login, getDashboardData, addRecentDraws, getAllRecentDraws, addConsultant, updateConsultant, getAllConsultants } from '../controllers/adminController';
import { createBlogPost, getAllBlogPosts, updateBlogPost } from '../controllers/blogController';
const router = Router();

router.post('/login', login);

// dashboard routes
router.get('/dashboard', getDashboardData);

// recentDraws routes
router.post('/recentDraws', addRecentDraws);
router.get('/recentDraws', getAllRecentDraws);

// consultant routes
router.post('/consultant', addConsultant);
router.put('/consultant', updateConsultant);
router.get('/consultant', getAllConsultants);

// blog routes
router.post('/blog', createBlogPost);
router.put('/blog/:id', updateBlogPost);
router.get('/blog', getAllBlogPosts);


export default router;  