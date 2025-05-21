import mongoose from "mongoose";

const consultationFeeSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
});

const consultantSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    logoUrl: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    shortBio: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },  
    officeAddress: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    serviceAreas: {
        type: [String],
        required: true,
    },
    membershipNumber: {
        type: String,
        required: true,
    },
    licenseStatus: {
        type: String,
        required: true,
    },
    licenseExpiry: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true,
    },
    websiteUrl: {
        type: String,
        required: true,
    },
    contactPersonName: {
        type: String,
        required: true,
    },
    contactPersonPhone: {
        type: String,
        required: true,
    },
    contactPersonEmail: {
        type: String,
        required: true,
    },
    deliveryEmail: {
        type: String,
        required: true,
    },
    languagesSpoken: {
        type: [String],
        required: true,
    },
    starRating: {
        type: Number,
        required: true,
    },
    totalNumberOfReviews: {
        type: Number,
        required: true,
    },
    testimonials: {
        type: [String],
        required: true,
    },
    areasOfExpertise: {
        type: [String],
        required: true,
    },
    consultationFees: {
        type: [consultationFeeSchema],
        required: true,
    },
    serviceStartsFrom: {
        type: Number,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        required: true,
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3],
    },
});

const Consultant = mongoose.model("Consultant", consultantSchema);

export default Consultant;
