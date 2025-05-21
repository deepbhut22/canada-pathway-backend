import express from 'express';
import { getBlogPosts, getBlogPostBySlug, getRelatedBlogPosts } from '../controllers/blogController';

const router = express.Router();

router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);
router.get('/related-category/:category/:slug', getRelatedBlogPosts);


export default router;