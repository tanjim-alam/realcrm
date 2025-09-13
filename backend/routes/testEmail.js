const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/email');
const Company = require('../models/Company');

// @route   POST /api/test-email
// @desc    Test SMTP configuration by sending a single email
// @access  Public (for testing only)
router.post('/', async (req, res) => {
  try {
    const { to, subject, message, companyId } = req.body;
    
    // Get company data if companyId provided
    let company = null;
    if (companyId) {
      company = await Company.findById(companyId);
    }
    
    // Default test email if no data provided
    const testTo = to || 'tanjim11alam@gmail.com';
    const testSubject = subject || `SMTP Test Email from ${company?.name || 'Real Estate CRM'}`;
    const testMessage = message || `
      <h2>🎉 SMTP Test Successful!</h2>
      <p>This is a test email to verify your Gmail SMTP configuration is working correctly.</p>
      <p><strong>Test Details:</strong></p>
      <ul>
        <li>From: ${company?.name || 'Real Estate CRM'}</li>
        <li>Company Email: ${company?.email || 'contact@yourcompany.com'}</li>
        <li>Company Phone: ${company?.phone || 'Contact us'}</li>
        <li>To: ${testTo}</li>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>Status: ✅ Working</li>
      </ul>
      <p>If you received this email, your SMTP setup is correct!</p>
      <hr>
      <p><em>This is an automated test email from your Real Estate CRM system.</em></p>
    `;

    console.log('Testing SMTP configuration...');
    console.log('Sending to:', testTo);
    console.log('Using company:', company?.name || 'Default');
    
    const result = await sendEmail(testTo, testSubject, testMessage, '', company);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        details: {
          to: testTo,
          subject: testSubject,
          messageId: result.messageId,
          response: result.response
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
    console.error('SMTP test error:', error);
    res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      error: error.message
    });
  }
});

module.exports = router;
