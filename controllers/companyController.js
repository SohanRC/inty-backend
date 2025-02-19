// controllers/companyController.js
const Company = require('../models/Company');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `company-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('logo');

// Get companies with pagination
const getCompanies = async (req, res) => {
  try {
    const { search, page = 1, limit, isAdmin } = req.query;
    let query = {};

    if (search) {
      query = { $text: { $search: search } };
    }

    // For admin dashboard, get all companies without pagination
    if (isAdmin === 'true') {
      const companies = await Company.find(query).sort({ createdAt: -1 });
      return res.json({
        companies,
        totalPages: 1,
        currentPage: 1,
        totalCompanies: companies.length
      });
    }

    // For public view, use pagination
    const limitNum = parseInt(limit) || 6;
    const skipNum = (parseInt(page) - 1) * limitNum;

    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .exec();

    const count = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(count / limitNum),
      currentPage: parseInt(page),
      totalCompanies: count
    });
  } catch (error) {
    console.error('Error in getCompanies:', error);
    res.status(500).json({ 
      message: 'Error fetching companies',
      error: error.message 
    });
  }
};

// Create a new company
const createCompany = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || err });
    }

    try {
      const logoPath = req.file ? `/uploads/${req.file.filename}` : null;
      
      const company = new Company({
        name: req.body.name,
        projects: parseInt(req.body.projects),
        experience: parseInt(req.body.experience),
        branches: parseInt(req.body.branches),
        logo: logoPath
      });

      const savedCompany = await company.save();
      res.status(201).json(savedCompany);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// Update company
const updateCompany = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || err });
    }

    try {
      const updates = { ...req.body };
      
      if (req.file) {
        updates.logo = `/uploads/${req.file.filename}`;
      }

      const company = await Company.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      res.json(company);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (company.logo) {
      const logoPath = path.join(__dirname, '..', company.logo.replace(/^\//, ''));
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all controller functions
module.exports = {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
};