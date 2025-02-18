// controllers/companyController.js
const Company = require('../models/Company');

// Get all companies
exports.getCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit = 9 } = req.query;
    let query = {};

    if (search) {
      query = { $text: { $search: search } };
    }

    const companies = await Company.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCompanies: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new company
exports.createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};