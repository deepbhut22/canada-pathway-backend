import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuth,
  googleCallback,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Register route with validation
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('password')
      .isLength({ min: 6 })
      // .isStrongPassword({
        // minLength: 6,
        // minLowercase: 1,
        // minUppercase: 1,
        // minNumbers: 1,
        // minSymbols: 1,
      // })
      .withMessage('Weak Password, Password must be {minLength: 6,/n minLowercase: 1, /n minUppercase: 1, /nminNumbers: 1, /n minSymbols: 1, }'),
  ],
  registerUser
);

// Login route with validation
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

// Profile routes (protected)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);


// Forgot password route
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// Delete account route
router.delete('/delete-account', protect, deleteAccount);


export default router;