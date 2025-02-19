const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

companySchema.index({ name: 'text' });
module.exports = mongoose.model('Company', companySchema);