// controllers/companyController.js
const Company = require('../models/Company');
const { upload, uploadFields, deleteFile } = require('../config/cloudinary');

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

// Middleware for handling file uploads
const handleUpload = upload.fields(uploadFields);

// Create a new company
const createCompany = async (req, res) => {
  handleUpload(req, res, async (err) => {
    // First check for multer/upload errors
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        message: err.message || 'Error uploading files',
        error: err.toString()
      });
    }

    try {
      // Log the request body and files for debugging
      console.log('Request body:', req.body);
      console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
      
      // Create a company data object from the form fields
      const companyData = {
        // Original required fields
        name: req.body.name,
        projects: parseInt(req.body.projects) || 0,
        experience: parseInt(req.body.experience) || 0,
        branches: parseInt(req.body.branches) || 0,
        
        // New fields from form
        registeredCompanyName: req.body.registeredCompanyName || '',
        nameDisplay: req.body.nameDisplay || '',
        description: req.body.description || '',
        ageOfCompany: req.body.ageOfCompany || '',
        availableCities: Array.isArray(req.body.availableCities) 
          ? req.body.availableCities 
          : (req.body.availableCities ? [req.body.availableCities] : []),
        officialWebsite: req.body.officialWebsite || '',
        fullName: req.body.fullName || '',
        designation: req.body.designation || '',
        phoneNumber: req.body.phoneNumber || '',
        minMaxBudget: req.body.minMaxBudget || '',
        type: req.body.type || '',
        discountsOfferTimeline: req.body.discountsOfferTimeline || '',
        numberOfProjectsCompleted: req.body.numberOfProjectsCompleted || '',
        contactEmail: req.body.contactEmail || '',
        googleRating: req.body.googleRating || '',
        googleReviews: req.body.googleReviews || '',
        googleLocation: req.body.googleLocation || '',
        anyAwardWon: req.body.anyAwardWon || '',
        categoryType: req.body.categoryType || '',
        paymentType: req.body.paymentType || '',
        assured: req.body.assured || '',
      };
      
      // Add file URLs from Cloudinary if they exist
      if (req.files) {
        // Add logo if uploaded
        if (req.files.logo && req.files.logo[0]) {
          companyData.logo = req.files.logo[0].path;
        }
        
        // Add banner images if uploaded
        for (let i = 0; i < 10; i++) {
          const fieldName = `bannerImage${i}`;
          if (req.files[fieldName] && req.files[fieldName][0]) {
            companyData[`bannerImage${i+1}`] = req.files[fieldName][0].path;
          }
        }
        
        // Add PDF documents if uploaded
        if (req.files.digitalBrochure && req.files.digitalBrochure[0]) {
          companyData.digitalBrochure = req.files.digitalBrochure[0].path;
        }
        
        if (req.files.testimonialsAttachment && req.files.testimonialsAttachment[0]) {
          companyData.testimonialsAttachment = req.files.testimonialsAttachment[0].path;
        }
      }
      
      // Create and save the company
      const company = new Company(companyData);
      const savedCompany = await company.save();
      
      res.status(201).json(savedCompany);
    } catch (error) {
      console.error('Error creating company:', error);
      // Enhanced error response
      return res.status(400).json({ 
        message: error.message,
        error: error.toString(),
        stack: error.stack,
        validation: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : undefined
      });
    }
  });
};

// Update company
const updateCompany = async (req, res) => {
  handleUpload(req, res, async (err) => {
    if (err) {
      console.error('Upload error during update:', err);
      return res.status(400).json({ 
        message: err.message || 'Error uploading files',
        error: err.toString()
      });
    }

    try {
      // Get existing company to check for files to delete
      const existingCompany = await Company.findById(req.params.id);
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }
      
      // Create update object from request body
      const updates = { ...req.body };
      
      // Handle numeric fields
      if (updates.projects) updates.projects = parseInt(updates.projects);
      if (updates.experience) updates.experience = parseInt(updates.experience);
      if (updates.branches) updates.branches = parseInt(updates.branches);
      
      // Handle array fields
      if (updates.availableCities) {
        updates.availableCities = Array.isArray(updates.availableCities) 
          ? updates.availableCities 
          : [updates.availableCities];
      }
      
      // Process file uploads and update URLs
      if (req.files) {
        // Update logo if uploaded
        if (req.files.logo && req.files.logo[0]) {
          // Delete old logo from Cloudinary
          if (existingCompany.logo) {
            await deleteFile(existingCompany.logo);
          }
          updates.logo = req.files.logo[0].path;
        }
        
        // Update banner images if uploaded
        for (let i = 0; i < 10; i++) {
          const fieldName = `bannerImage${i}`;
          const dbFieldName = `bannerImage${i+1}`;
          
          if (req.files[fieldName] && req.files[fieldName][0]) {
            // Delete old banner from Cloudinary
            if (existingCompany[dbFieldName]) {
              await deleteFile(existingCompany[dbFieldName]);
            }
            updates[dbFieldName] = req.files[fieldName][0].path;
          }
        }
        
        // Update PDF documents if uploaded
        if (req.files.digitalBrochure && req.files.digitalBrochure[0]) {
          // Delete old brochure from Cloudinary
          if (existingCompany.digitalBrochure) {
            await deleteFile(existingCompany.digitalBrochure);
          }
          updates.digitalBrochure = req.files.digitalBrochure[0].path;
        }
        
        if (req.files.testimonialsAttachment && req.files.testimonialsAttachment[0]) {
          // Delete old testimonials from Cloudinary
          if (existingCompany.testimonialsAttachment) {
            await deleteFile(existingCompany.testimonialsAttachment);
          }
          updates.testimonialsAttachment = req.files.testimonialsAttachment[0].path;
        }
      }

      // Update the company in the database
      const company = await Company.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ 
        message: error.message,
        error: error.toString(),
        validation: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : undefined
      });
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

    // Delete all files associated with this company from Cloudinary
    const fileFields = [
      'logo', 
      'bannerImage1', 'bannerImage2', 'bannerImage3', 'bannerImage4', 'bannerImage5',
      'bannerImage6', 'bannerImage7', 'bannerImage8', 'bannerImage9', 'bannerImage10',
      'digitalBrochure', 'testimonialsAttachment'
    ];
    
    // Delete files in parallel using Promise.all
    await Promise.all(
      fileFields
        .filter(field => company[field]) // Only process fields that have a value
        .map(field => deleteFile(company[field]))
    );

    // Delete company from database
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
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