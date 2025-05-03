// User types
export interface UserDocument extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Basic Info
export interface BasicInfo {
  fullName: string;
  email: string;
  gender: string;
  age: number;
  citizenCountry: string;
  residenceCountry: string;
  province?: string;
}

// Language Info
export interface LanguageTest {
  type: string;
  testDate: string;
  meetsMinimumScore: boolean;
  readingScore?: number | null;
  writingScore?: number | null;
  speakingScore?: number | null;
  listeningScore?: number | null;
}

export interface LanguageInfo {
  primaryLanguage: string;
  hasTakenTest: boolean;
  primaryLanguageTest: LanguageTest;
  hasSecondLanguage: boolean;
  secondLanguageTest: LanguageTest;
}

// Education Info
export interface Education {
  // institution: string;
  type: string;
  fieldOfStudy: string;
  inProgress: boolean;
  province?: string;
  country: string;
}

export interface EducationInfo {
  hasHighSchool: boolean;
  hasPostSecondary: boolean;
  educationList: Education[];
}

// Spouse Info
export interface SpouseInfo {
  maritalStatus: string;
  hasCanadianWorkExp: boolean;
  hasCanadianStudyExp: boolean;
  hasRelativeInCanada: boolean;
  educationLevel: string;
}

// Dependent Info
export interface Dependent {
  age: number;
  citizenCountry: string;
  residenceCountry: string;
  residencyStatus?: string;
}

export interface DependentInfo {
  hasDependents: boolean;
  dependentList: Dependent[];
}

// Connection Info
export interface Connection {
  relationship: string;
  province: string;
  residencyStartDate: string;
  residencyStatus: string;
}

export interface ConnectionInfo {
  doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident: boolean;
}

// Work Experience Info
export interface WorkExperience {
  jobTitle: string;
  // isPaid: boolean;
  isSelfEmployed: boolean;
  // hoursPerWeek: number;
  country: string;
  province?: string;
  workPermitType?: string;
  // hasLMIA: boolean;
  nocCode: string;
  // startDate: string;
  // endDate: string;
  isCurrentJob: boolean;
  numberOfMonths: number;
  tier: string;
}

export interface WorkInfo {
  hasWorkExperience: boolean;
  workExperienceList: WorkExperience[];
}

// Job Offer Info
export interface JobOffer {
  jobTitle: string;
  nocCode: string;
  // isPaid: boolean;
  // hoursPerWeek: number | null;
  province: string;
  // isLMIA: boolean;
  startDate: string;
  tier: string;
  // hasEndDate: boolean;
  // endDate: string;
}

export interface JobOfferInfo {
  hasJobOffer: boolean;
  jobOffer: JobOffer;
}

// Complete User Profile
export interface UserProfile {
  basicInfo: BasicInfo;
  languageInfo: LanguageInfo;
  educationInfo: EducationInfo;
  spouseInfo: SpouseInfo;
  dependentInfo: DependentInfo;
  connectionInfo: ConnectionInfo;
  workInfo: WorkInfo;
  jobOfferInfo: JobOfferInfo;
  isComplete: boolean;
}

// News types
export interface News {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: string;
  readMoreLink: string;
  imageUrl: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}