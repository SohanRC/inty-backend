const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
});

// Get all companies with pagination
router.get('/', companyController.getCompanies);

// Create a new company
router.post('/', companyController.createCompany);

// Update a company
router.put('/:id', companyController.updateCompany);

// Delete a company
router.delete('/:id', companyController.deleteCompany);

module.exports = router;