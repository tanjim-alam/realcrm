const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = (smtpConfig = null) => {
  if (smtpConfig) {
    // Use company's SMTP configuration
    return nodemailer.createTransport({
      host: smtpConfig.host || 'smtp.gmail.com',
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.auth?.user || process.env.EMAIL_USER,
        pass: smtpConfig.auth?.pass || process.env.EMAIL_APP_PASSWORD
      }
    });
  } else {
    // Use default Gmail configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || "tanjim11alam@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "heomrbwqxaaxhppj"
      }
    });
  }
};

// Send email function
const sendEmail = async (to, subject, html, text = '', companyData = null) => {
  try {
    // Use company's SMTP config if available, otherwise use default
    const transporter = createTransporter(companyData?.smtpConfig);
    
    // Use company data if provided, otherwise fallback to environment variables
    const companyName = companyData?.name || process.env.COMPANY_NAME || 'Real Estate CRM';
    const companyEmail = companyData?.email || process.env.EMAIL_USER;
    
    // Use company email as sender if they have SMTP configured, otherwise use Gmail
    const senderEmail = companyData?.smtpConfig?.auth?.user || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: `"${companyName}" <${senderEmail}>`,
      replyTo: companyEmail,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Convert HTML to text if no text provided
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('From:', mailOptions.from);
    console.log('Reply-To:', mailOptions.replyTo);
    console.log('Using SMTP:', companyData?.smtpConfig ? 'Company SMTP' : 'Default Gmail');
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send bulk emails with delay to avoid rate limiting
const sendBulkEmails = async (emails, delayMs = 1000) => {
  const results = [];
  
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`Sending email ${i + 1}/${emails.length} to ${email.to}`);
    
    const result = await sendEmail(email.to, email.subject, email.html, email.text);
    results.push({
      to: email.to,
      ...result
    });
    
    // Add delay between emails to avoid rate limiting
    if (i < emails.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  createTransporter
};
