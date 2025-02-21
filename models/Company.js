const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Original fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  reviews: {
    type: Number,
    default: 0
  },
  projects: {
    type: Number,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  branches: {
    type: Number,
    required: true
  },
  
  // New fields from screenshots
  registeredCompanyName: {
    type: String,
    trim: true
  },
  nameDisplay: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  ageOfCompany: {
    type: String
  },
  availableCities: {
    type: [String]
  },
  officialWebsite: {
    type: String
  },
  fullName: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String
  },
  minMaxBudget: {
    type: String
  },
  type: {
    type: String
  },
  // Banner images
  bannerImage1: {
    type: String
  },
  bannerImage2: {
    type: String
  },
  bannerImage3: {
    type: String
  },
  bannerImage4: {
    type: String
  },
  bannerImage5: {
    type: String
  },
  bannerImage6: {
    type: String
  },
  bannerImage7: {
    type: String
  },
  bannerImage8: {
    type: String
  },
  bannerImage9: {
    type: String
  },
  bannerImage10: {
    type: String
  },
  discountsOfferTimeline: {
    type: String
  },
  numberOfProjectsCompleted: {
    type: String
  },
  digitalBrochure: {
    type: String
  },
  testimonialsAttachment: {
    type: String
  },
  contactEmail: {
    type: String
  },
  googleRating: {
    type: String
  },
  googleReviews: {
    type: String
  },
  googleLocation: {
    type: String
  },
  anyAwardWon: {
    type: String
  },
  categoryType: {
    type: String
  },
  paymentType: {
    type: String
  },
  assured: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

companySchema.index({ name: 'text', registeredCompanyName: 'text', description: 'text' });
module.exports = mongoose.model('Company', companySchema);