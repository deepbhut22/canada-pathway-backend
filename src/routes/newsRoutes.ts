import express from 'express';
import { body } from 'express-validator';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);

// Protected routes (for admin users)
// Note: In a real app, you'd want to add an admin check middleware
router.post(
  '/',
  protect,
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot be more than 200 characters'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type')
      .notEmpty()
      .withMessage('Type is required')
      .isIn(['Immigration', 'Policy', 'Legal', 'General', 'Other'])
      .withMessage('Invalid news type'),
    body('readMoreLink').notEmpty().withMessage('Read more link is required'),
    body('imageUrl').notEmpty().withMessage('Image URL is required'),
    body('source').notEmpty().withMessage('Source is required'),
  ],
  createNews
);

router.put(
  '/:id',
  protect,
  [
    body('title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Title cannot be more than 200 characters'),
    body('type')
      .optional()
      .isIn(['Immigration', 'Policy', 'Legal', 'General', 'Other'])
      .withMessage('Invalid news type'),
  ],
  updateNews
);

router.delete('/:id', protect, deleteNews);

export default router;