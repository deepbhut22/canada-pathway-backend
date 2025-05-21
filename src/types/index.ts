export interface UserDocument extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date | undefined;
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
  mobileNumber: string;
}

// Language Info
export interface LanguageTest {
  type: string;
  clbScore: number;
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
  teer: number;
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
  tier: number;
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
  updatedAt?: Date;
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

// Chat History
export interface ChatMessage {
  role: string;
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  userId: string;
  messages: ChatMessage[];
}

export enum DrawType {
  EXPRESS_ENTRY = 'Express Entry',
  PROVINCIAL = 'Provincial'
}

export interface RecentDraw {
  id: string;
  number: number;
  date: string;
  type: string;
  invitations: number;
  crsCutOff: number;
  drawType: DrawType;
  sourceURL: string;
  createdAt: Date;
}

export interface ConsultationFee {
  serviceName: string;
  cost: number;
  duration: string;
}

export interface Consultant {
  id: string;
  category: string;
  businessName: string;
  logoUrl: string;
  fullName: string;
  shortBio: string;
  about: string;
  officeAddress: string;
  city: string;
  serviceAreas: string[];
  membershipNumber: string;
  licenseStatus: string;
  licenseExpiry: string;
  phoneNumber: string;
  emailAddress: string;
  websiteUrl: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  deliveryEmail: string;
  languagesSpoken: string[];
  starRating: number;
  totalNumberOfReviews: number;
  testimonials: string[];
  areasOfExpertise: string[];
  consultationFees: ConsultationFee[];
  serviceStartsFrom: number;
  isFeatured: boolean;
  level: 1 | 2 | 3;
}

export interface TableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ImageData {
  src: string;              
  alt: string;               
  caption?: string;
  position?: 'left' | 'center' | 'right';
}

export interface VideoData {
  url: string;               
  type: 'youtube' | 'vimeo' | 'mp4';
  caption?: string;
}

export interface BlogPost {
  slug: string;              
  title: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  thumbnailUrl: string;    
  excerpt: string;           
  content: string;           
  categories: string[];      
  tags?: string[] | '';           
  tableData?: TableData[] | '';
  imageData?: ImageData[] | '';
  videoData?: VideoData[] | '';

  status: 'draft' | 'published' | 'archived';
  readingTime?: number;      

  createdAt: string;         
  updatedAt: string;         
  publishedAt?: string;      

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    openGraphImageUrl?: string;
  };
  isFeatured: boolean;
}
