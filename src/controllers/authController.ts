import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/userModel';
import UserProfile from '../models/userProfileModel';
import generateToken from '../utils/generateToken';
import { AppError } from '../middleware/errorMiddleware';
import { log } from 'node:console';

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
    console.log(req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    console.log("user : ", user);

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
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
    const user = await User.findById(req.user._id);

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
    const user = await User.findById(req.user._id);

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