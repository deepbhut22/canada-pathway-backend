import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import UserProfile from '../models/userProfileModel';
import User from '../models/userModel';
import { AppError } from '../middleware/errorMiddleware';
import { LanguageTest } from '../types';
// @desc    Get complete user profile
// @route   GET /api/profile
// @access  Private
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    res.json(userProfile);
  } catch (error) {
    next(error);
  }
};

// @desc    Update basic info
// @route   PUT /api/profile/basic-info
// @access  Private
export const updateBasicInfo = async (
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

    const userProfile = await UserProfile.findOne({ user: req.user._id });    

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.basicInfo = {
      // ...userProfile.basicInfo,
      ...req.body,
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    console.log(updatedProfile.basicInfo);
    
    
    res.json(updatedProfile.basicInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update language info
// @route   PUT /api/profile/language-info
// @access  Private
export const updateLanguageInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.log(errors);
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.languageInfo = {
      // ...userProfile.languageInfo,
      ...req.body,
    };

    userProfile.languageInfo = {
      ...req.body,
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.languageInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update education info
// @route   PUT /api/profile/education-info
// @access  Private
export const updateEducationInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }
    userProfile.educationInfo = {
      hasHighSchool: req.body.hasHighSchool,
      hasPostSecondary: req.body.hasPostSecondary,
      educationList: req.body.educationList.map(({ id, ...rest }: { id: any; [key: string]: any }) => rest)
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.educationInfo);
  } catch (error) {
    console.log(error);
    
    next(error);
  }
};

// @desc    Update spouse info
// @route   PUT /api/profile/spouse-info
// @access  Private
export const updateSpouseInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.spouseInfo = {
      // ...userProfile.spouseInfo,
      ...req.body,
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.spouseInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update dependent info
// @route   PUT /api/profile/dependent-info
// @access  Private
export const updateDependentInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.dependentInfo = {
      // ...userProfile.dependentInfo,
      hasDependents: req.body.hasDependents,
      dependentList: req.body.dependentList.map(({ id, ...rest }: { id: any; [key: string]: any }) => rest),
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    
    res.json(updatedProfile.dependentInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update connection info
// @route   PUT /api/profile/connection-info
// @access  Private
export const updateConnectionInfo = async (
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

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.connectionInfo = {
      // ...userProfile.connectionInfo,
      doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident: req.body.doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident,
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.connectionInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Update work info
// @route   PUT /api/profile/work-info
// @access  Private
export const updateWorkInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.workInfo = {
      // ...userProfile.workInfo,
      hasWorkExperience: req.body.hasWorkExperience,  
      workExperienceList: req.body.workExperienceList.map(({ id, ...rest }: { id: any; [key: string]: any }) => rest),
    };

    // Update profile completion status
    await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.workInfo);
  } catch (error) {
    console.log(error);
    
    next(error);
  }
};

// @desc    Update job offer info
// @route   PUT /api/profile/job-offer-info
// @access  Private
export const updateJobOfferInfo = async (
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

    const userProfile = await UserProfile.findOne({ user: req.user._id });

    if (!userProfile) {
      return next(new AppError('User profile not found', 404));
    }

    userProfile.jobOfferInfo = {
      // ...userProfile.jobOfferInfo,
      hasJobOffer: req.body.hasJobOffer,
      jobOffer: req.body.jobOffer,
    };

    // // Update profile completion status
    // await checkProfileCompletion(req.user._id);

    const updatedProfile = await userProfile.save();
    res.json(updatedProfile.jobOfferInfo);
  } catch (error) {
    next(error);
  }
};

// Helper function to check profile completion
const checkProfileCompletion = async (userId: string): Promise<void> => {
  try {
    const userProfile = await UserProfile.findOne({ user: userId });
    const user = await User.findById(userId);

    if (!userProfile || !user) {
      return;
    }

    // Check if all required sections are completed
    // This is a simplified check - you may want to add more detailed validation
    const isComplete = Boolean(
      userProfile.basicInfo.fullName &&
        userProfile.basicInfo.email &&
        userProfile.basicInfo.gender &&
        userProfile.languageInfo.primaryLanguage &&
        (userProfile.educationInfo.hasHighSchool || 
         userProfile.educationInfo.hasPostSecondary) &&
        userProfile.spouseInfo.maritalStatus &&
        (userProfile.workInfo.hasWorkExperience === false || 
         userProfile.workInfo.workExperienceList.length > 0)
    );

    // Update profile completion status
    userProfile.isComplete = isComplete;
    await userProfile.save();

    // Update user profile completion status
    user.profileComplete = isComplete;
    await user.save();
  } catch (error) {
    console.error('Error checking profile completion:', error);
  }
};