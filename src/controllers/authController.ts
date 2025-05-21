import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/userModel';
import UserProfile from '../models/userProfileModel';
import generateToken from '../utils/generateToken';
import { AppError } from '../middleware/errorMiddleware';
import passport from 'passport';
import { UserDocument } from '../types/index';
import { sendWelcomeEmail, sendResetPasswordEmail } from '../utils/email';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("error in validation in registerUser : ", errors);
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { email, firstName, lastName, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Create new user
    const user = await User.create({
      email,
      firstName,
      lastName,
      password,
      profileComplete: false,
    });

    if (user) {
      // Create empty user profile
      await UserProfile.create({
        user: user._id,
        isComplete: false,
        basicInfo: {
          fullName: user.firstName + " " + user.lastName,
          email: user.email
        }
      });

      console.log("sending welcome email to : ", user.email);
      await sendWelcomeEmail(user.email, user.firstName);
      console.log("welcome email sent to : ", user.email);

      res.status(201).json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileComplete: user.profileComplete,
        token: generateToken(user._id, user.email, user.firstName),
      });
    } else {
      return next(new AppError('Invalid user data', 400));
    }
  } catch (error) {
    console.log("error in registerUser : ", error); 
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileComplete: user.profileComplete,
        token: generateToken(user._id, user.email, user.firstName),
      });
    } else {
      return next(new AppError('Invalid email or password', 401));
    }
  } catch (error) {
    console.log("error in loginUser : ", error);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById((req.user as UserDocument)._id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const userProfile = await UserProfile.findOne({ user: user._id }).select('-_id -user');

    if (user && userProfile) {
      res.json({
        user,
        userProfile,
      });
    } else {
      return next(new AppError('User not found', 404));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById((req.user as UserDocument)._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profileComplete: updatedUser.profileComplete,
        token: generateToken(updatedUser._id, updatedUser.email, updatedUser.firstName),
      });
    } else {
      return next(new AppError('User not found', 404));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login/signup
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  console.log("googleCallback");
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err) {
      return next(new AppError('Google authentication failed', 401));
    }

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.firstName);
    // Redirect to frontend with token
    res.redirect(`http://pathpr.ca/auth/google?token=${token}`);
  })(req, res, next);
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set reset token and expiry (e.g., 15 mins)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    console.log("resetUrl : ", resetUrl);
    // Send email with reset link
    await sendResetPasswordEmail(email, resetUrl);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return next(new AppError('Missing token, email, or password', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    // Find user with matching token and check if not expired
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;

    // Clear reset token fields
    user.passwordResetToken = '';
    user.passwordResetExpires = new Date();
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as UserDocument)._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(user._id);

    await UserProfile.findByIdAndDelete(user._id);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
}
