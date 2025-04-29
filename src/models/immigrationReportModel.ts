import mongoose, { Schema, Document } from 'mongoose';

// Express Entry Report Schema
const ExpressEntryReportSchema = new Schema({
  crsScore: { type: Number, required: true },
  scoreBreakdown: {
    coreHumanCapital: {
      score: { type: Number, required: true },
      maximum: { type: Number, required: true },
      reason: { type: String, required: true }
    },
    spouseFactors: {
      score: { type: Number, required: true },
      maximum: { type: Number, required: true },
      reason: { type: String, required: true }
    },
    skillTransferability: {
      score: { type: Number, required: true },
      maximum: { type: Number, required: true },
      reason: { type: String, required: true }
    },
    additionalPoints: {
      score: { type: Number, required: true },
      maximum: { type: Number, required: true },
      reason: { type: String, required: true }
    }
  },
  eligibilityStatus: [{
    program: { type: String, required: true },
    isEligible: { type: Boolean, required: true },
    details: { type: String, required: true }
  }],
  categoryBasedEligibility: [{
    program: { type: String, required: true },
    isEligible: { type: Boolean, required: true },
    details: { type: String, required: true }
  }]
});

const PNPReportSchema = new Schema({
  pnpAssessment: [{
    province: { type: String, required: true },
    stream_name: { type: String, required: true },
    status: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  suggestions: [{
    action: { type: String, required: true },
    reason: { type: String, required: true }
  }]
});


// Immigration Report Schema
const ImmigrationReportSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expressEntry: {
    type: ExpressEntryReportSchema,
    required: true,
    default: null
  },
  pnp: {
    type: PNPReportSchema,
    required: true,
    default: null
  },
  alternativePathways: {
    type: Schema.Types.Mixed,
    default: null
  },
  nextSteps: {
    type: Schema.Types.Mixed,
    default: null
  },
  recommendations: {
    type: Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
ImmigrationReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ImmigrationReport = mongoose.model('ImmigrationReport', ImmigrationReportSchema);

export default ImmigrationReport; 