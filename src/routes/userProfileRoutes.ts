import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateBasicInfo,
  updateLanguageInfo,
  updateEducationInfo,
  updateSpouseInfo,
  updateDependentInfo,
  updateConnectionInfo,
  updateWorkInfo,
  updateJobOfferInfo,
} from '../controllers/userProfileController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get complete profile
router.get('/', getUserProfile);

// Basic info route
router.put(
  '/basic',
  [
    body('fullName').optional(),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('gender').optional(),
    body('citizenCountry').optional(),
    body('residenceCountry').optional(),
    body('age').optional().isNumeric(),
    body('province').optional(),
  ],
  updateBasicInfo
);

// Language info route
router.put(
  '/language',
  [
    body('primaryLanguage').isIn(['english', 'french']),
    body('hasTakenTest').optional().isBoolean(),
    body('primaryLanguageTest.type').optional({nullable: true}),
    body('primaryLanguageTest.testDate').optional({nullable: true}),
    body('primaryLanguageTest.readingScore').optional({ nullable: true }).isNumeric(),
    body('primaryLanguageTest.writingScore').optional({ nullable: true }).isNumeric(),
    body('primaryLanguageTest.speakingScore').optional({ nullable: true }).isNumeric(),
    body('primaryLanguageTest.listeningScore').optional({ nullable: true }).isNumeric(),
    body('hasSecondLanguage').optional().isBoolean(),
    body('secondLanguageTest.type').optional({nullable: true}),
    body('secondLanguageTest.testDate').optional({nullable: true}),
    body('secondLanguageTest.readingScore').optional({ nullable: true }).isNumeric(),
    body('secondLanguageTest.writingScore').optional({ nullable: true }).isNumeric(),
    body('secondLanguageTest.speakingScore').optional({ nullable: true }).isNumeric(),
    body('secondLanguageTest.listeningScore').optional({ nullable: true }).isNumeric(),
  ],
  updateLanguageInfo
);

// Education info route
router.put(
  '/education',
  [
    body('hasHighSchool').optional().isBoolean(),
    body('hasPostSecondary').optional().isBoolean(),
    body('educationList').optional().isArray(),
    body('educationList.*.institution').optional(),
    body('educationList.*.degree').optional(),
    body('educationList.*.fieldOfStudy').optional(),
    body('educationList.*.country').optional(),
  ],
  updateEducationInfo
);

// Spouse info route
router.put(
  '/spouse',
  [
    body('maritalStatus').optional(),
    body('hasCanadianWorkExp').optional({nullable: true}).isBoolean(),
    body('hasCanadianStudyExp').optional({nullable: true}).isBoolean(),
    body('hasRelativeInCanada').optional({nullable: true}).isBoolean(),
    body('educationLevel').optional({nullable: true}),
  ],
  updateSpouseInfo
);

// Dependent info route
router.put(
  '/dependent',
  [
    body('hasDependents').optional().isBoolean(),
    body('dependentList').optional().isArray(),
    body('dependentList.*.age').optional().isNumeric(),
    body('dependentList.*.citizenCountry').optional(),
    body('dependentList.*.residenceCountry').optional(),
  ],
  updateDependentInfo
);

// Connection info route
router.put(
  '/connection',
  [
    body('doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident').optional().isBoolean(),
  ],
  updateConnectionInfo
);

// Work info route
router.put(
  '/work',
  [
    body('hasWorkExperience').optional().isBoolean(),
    body('workExperienceList').optional().isArray(),
    body('workExperienceList.*.jobTitle').optional(),
    body('workExperienceList.*.country').optional(),
    body('workExperienceList.*.isCurrentJob').optional().isBoolean(),
    body('workExperienceList.*.numberOfMonths').optional().isNumeric(),
    body('workExperienceList.*.tier').optional(),
  ],
  updateWorkInfo
);

// Job offer info route
router.put(
  '/joboffer',
  [
    body('hasJobOffer').optional().isBoolean(),
    body('jobOffer.occupation').optional(),
    body('jobOffer.nocCode').optional(),
    body('jobOffer.isPaid').optional().isBoolean(),
    body('jobOffer.hoursPerWeek').optional().isNumeric(),
    body('jobOffer.province').optional(),
    body('jobOffer.isLMIAExempt').optional().isBoolean(),
    body('jobOffer.startDate').optional(),
    body('jobOffer.hasEndDate').optional().isBoolean(),
    body('jobOffer.endDate').optional(),
  ],
  updateJobOfferInfo
);

export default router;