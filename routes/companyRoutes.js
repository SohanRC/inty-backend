// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Get all companies with pagination
router.get('/', companyController.getCompanies);

// Get Company with a particular Id
router.get('/getCompany/:id', companyController.getCompanyById);

// Create a new company - no upload middleware here as it's handled in controller
router.post('/', companyController.createCompany);

// Update a company - no upload middleware here as it's handled in controller
router.put('/:id', companyController.updateCompany);

// Delete a company
router.delete('/:id', companyController.deleteCompany);

module.exports = router;