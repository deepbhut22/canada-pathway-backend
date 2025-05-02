import mongoose, { Schema, Document } from 'mongoose';
import { UserProfile } from '../types';

export interface IUserProfile extends Document, UserProfile {
  user: mongoose.Types.ObjectId;
}

// Language Test Schema
const LanguageTestSchema: Schema = new Schema({
  type: { type: String, default: '' },
  testDate: { type: String, default: '' },
  readingScore: { type: Number, default: null, required: false },
  writingScore: { type: Number, default: null, required: false },
  speakingScore: { type: Number, default: null, required: false },
  listeningScore: { type: Number, default: null, required: false },
  meetsMinimumScore: { type: Boolean, default: null, required: false },
});

// Education Schema
const EducationSchema: Schema = new Schema({
  // institution: { type: String, required: true },
  type: { type: String, required: true },
  province: { type: String, required: false },
  fieldOfStudy: { type: String, required: true },
  inProgress: { type: Boolean, required: true },
  country: { type: String, required: true },
});

// Dependent Schema
const DependentSchema: Schema = new Schema({
  // name: { type: String, required: true },
  // relationship: { type: String, required: true },
  age: { type: Number, required: true },
  citizenCountry: { type: String, required: true },
  residenceCountry: { type: String, required: true },
  residencyStatus: {
    type: String, 
    // enum: ['permanent residence', 'work permit', 'student permit', 'citizen', 'refugee', 'other'], 
    // required: true   
  },

});

// Connection Schema
const ConnectionSchema: Schema = new Schema({
  relationship: { type: String, required: true },
  residencyStatus: {
    type: String, 
    enum: ['permanent residence', 'work permit', 'student permit', 'citizen', 'refugee', 'other'], 
    required: true 
  },
  province: { type: String, required: true },
  residencyStartDate: { type: String, required: true },
});

// Work Experience Schema
const WorkExperienceSchema: Schema = new Schema({
  jobTitle: { type: String, required: true },
  // isPaid: { type: Boolean, required: true },
  isSelfEmployed: { type: Boolean, required: true },
  // hoursPerWeek: { type: Number, required: true },
  country: { type: String, required: true },
  province: { type: String },
  workPermitType: {
    type: String,
    // enum: ['open', 'closed', 'citizen', 'refugee', 'other'],
    // required: true
  },
  // hasLMIA: { type: Boolean, required: true },
  nocCode: { type: String, required: true },
  // startDate: { type: String, required: true },
  // endDate: { type: String, default: '' },
  isCurrentJob: { type: Boolean, default: false },
  numberOfMonths: { type: Number, required: true },
  tier: { type: String, required: false },
});

// Job Offer Schema
const JobOfferSchema: Schema = new Schema({
  jobTitle: { type: String, default: '' },
  nocCode: { type: String, default: '' },
  // isPaid: { type: Boolean, default: false },
  // hoursPerWeek: { type: Number, default: null },
  province: { type: String, default: '' },
  // isLMIA: { type: Boolean, default: false },
  startDate: { type: String, default: '' },
  // hasEndDate: { type: Boolean, default: false },
  // endDate: { type: String, default: '' },
  tier: { type: String, required: false },
});

// Basic Info Schema
const BasicInfoSchema: Schema = new Schema({
  fullName: { type: String, default: '' },
  email: { type: String, default: '' },
  gender: { type: String, default: '' },
  age: { type: Number, default: null },
  citizenCountry: { type: String, default: '' },
  residenceCountry: { type: String, default: '' },
  province: { type: String, default: '' },
});

// Language Info Schema
const LanguageInfoSchema: Schema = new Schema({
  primaryLanguage: { type: String, default: '' },
  hasTakenTest: { type: Boolean, default: false },
  primaryLanguageTest: { type: LanguageTestSchema, default: () => ({}) },
  hasSecondLanguage: { type: Boolean, default: false },
  secondLanguageTest: { type: LanguageTestSchema, default: () => ({}) },
});

// Education Info Schema
const EducationInfoSchema: Schema = new Schema({
  hasHighSchool: { type: Boolean, default: false },
  hasPostSecondary: { type: Boolean, default: false },
  educationList: [EducationSchema],
});

// Spouse Info Schema
const SpouseInfoSchema: Schema = new Schema({
  maritalStatus: { type: String, default: '' },
  hasCanadianWorkExp: { type: Boolean, default: false },
  hasCanadianStudyExp: { type: Boolean, default: false },
  hasRelativeInCanada: { type: Boolean, default: false },
  educationLevel: { type: String, default: '' },
});

// Dependent Info Schema
const DependentInfoSchema: Schema = new Schema({
  hasDependents: { type: Boolean, default: false },
  dependentList: [DependentSchema],
});

// Connection Info Schema
const ConnectionInfoSchema: Schema = new Schema({
  // hasConnections: { type: Boolean, default: false },
  // connectionList: [ConnectionSchema],
  doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident: { type: Boolean, default: false },
});

// Work Info Schema
const WorkInfoSchema: Schema = new Schema({
  hasWorkExperience: { type: Boolean, default: false },
  workExperienceList: [WorkExperienceSchema],
});

// Job Offer Info Schema
const JobOfferInfoSchema: Schema = new Schema({
  hasJobOffer: { type: Boolean, default: false },
  jobOffer: { type: JobOfferSchema, default: () => ({}) },
});

// User Profile Schema
const UserProfileSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    basicInfo: { type: BasicInfoSchema, default: () => ({}) },
    languageInfo: { type: LanguageInfoSchema, default: () => ({}) },
    educationInfo: { type: EducationInfoSchema, default: () => ({}) },
    spouseInfo: { type: SpouseInfoSchema, default: () => ({}) },
    dependentInfo: { type: DependentInfoSchema, default: () => ({}) },
    connectionInfo: { type: ConnectionInfoSchema, default: () => ({}) },
    workInfo: { type: WorkInfoSchema, default: () => ({}) },
    jobOfferInfo: { type: JobOfferInfoSchema, default: () => ({}) },
    isComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model<IUserProfile>(
  'UserProfile',
  UserProfileSchema
);

export default UserProfile;