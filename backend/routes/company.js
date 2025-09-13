const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/company
// @desc    Get company details
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/company
// @desc    Update company details
// @access  Private
router.put('/', authMiddleware, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('smtpConfig.host').optional().trim(),
  body('smtpConfig.port').optional().isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
  body('smtpConfig.secure').optional().isBoolean(),
  body('smtpConfig.auth.user').optional().isEmail().withMessage('SMTP user must be a valid email'),
  body('smtpConfig.auth.pass').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, smtpConfig } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (smtpConfig) updateData.smtpConfig = smtpConfig;

    const company = await Company.findByIdAndUpdate(
      req.user.companyId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company updated successfully', company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/company/test-email
// @desc    Test company's SMTP configuration
// @access  Private
router.post('/test-email', authMiddleware, async (req, res) => {
  try {
    const { to } = req.body;
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { sendEmail } = require('../config/email');
    
    const testSubject = `Test Email from ${company.name}`;
    const testMessage = `
      <h2>🎉 SMTP Test Successful!</h2>
      <p>This is a test email from your company's email configuration.</p>
      <p><strong>Company Details:</strong></p>
      <ul>
        <li>Company: ${company.name}</li>
        <li>Email: ${company.email}</li>
        <li>Phone: ${company.phone || 'Not set'}</li>
        <li>SMTP Host: ${company.smtpConfig?.host || 'Default Gmail'}</li>
        <li>Time: ${new Date().toLocaleString()}</li>
      </ul>
      <p>If you received this email, your company email setup is working!</p>
    `;

    const result = await sendEmail(to || company.email, testSubject, testMessage, '', company);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        details: {
          from: company.name,
          to: to || company.email,
          messageId: result.messageId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
