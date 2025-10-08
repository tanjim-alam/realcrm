const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "tanjim11alam@gmail.com",
        pass: process.env.SMTP_PASS || "heomrbwqxaaxhppj"
    }
});

const sendNotificationEmail = async (notification, userEmail) => {
    try {
        console.log('🔍 ===== EMAIL SERVICE DEBUG START =====');
        console.log('📧 Email service called with:', {
            notificationId: notification._id,
            notificationTitle: notification.title,
            notificationType: notification.type,
            userEmail: userEmail
        });

        if (!transporter || !userEmail) {
            console.log('❌ Email service not configured or no email provided');
            console.log('🔍 Transporter exists:', !!transporter);
            console.log('🔍 User email provided:', !!userEmail);
            console.log('🔍 ===== EMAIL SERVICE DEBUG END (NO CONFIG) =====');
            return false;
        }

        const mailOptions = {
            from: "tanjim11alam@gmail.com" || "tanjim11alam@gmail.com",
            to: userEmail,
            subject: notification.title,
            html: generateEmailTemplate(notification)
        };

        console.log('📧 Mail options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            htmlLength: mailOptions.html.length
        });

        console.log('📧 Attempting to send email...');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        console.log('📧 Email response:', result);
        console.log('🔍 ===== EMAIL SERVICE DEBUG END (SUCCESS) =====');
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            response: error.response,
            stack: error.stack
        });
        console.log('🔍 ===== EMAIL SERVICE DEBUG END (ERROR) =====');
        return false;
    }
};

const generateEmailTemplate = (notification) => {
    const priorityColors = {
        'urgent': '#dc2626',
        'high': '#ea580c',
        'medium': '#d97706',
        'low': '#16a34a'
    };

    const platformIcons = {
        'website': '🌐',
        'google_ads': '🔍',
        'meta_ads': '📘',
        'hubspot': '🟠',
        'salesforce': '🔵',
        'zapier': '⚡',
        'manual': '👤'
    };

    const priorityColor = priorityColors[notification.priority] || '#6b7280';
    const platformIcon = platformIcons[notification.platform] || '📢';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${notification.title}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .notification-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; background-color: ${priorityColor}; }
                .platform-info { display: flex; align-items: center; margin: 10px 0; }
                .platform-icon { font-size: 20px; margin-right: 10px; }
                .message { font-size: 16px; margin: 15px 0; }
                .metadata { background: #f1f5f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 New Notification</h1>
                    <p>Real Estate CRM System</p>
                </div>
                <div class="content">
                    <div class="notification-card">
                        <div class="platform-info">
                            <span class="platform-icon">${platformIcon}</span>
                            <span><strong>Platform:</strong> ${notification.platform.replace('_', ' ').toUpperCase()}</span>
                            <span class="priority-badge">${notification.priority.toUpperCase()}</span>
                        </div>
                        
                        <h2>${notification.title}</h2>
                        <div class="message">${notification.message}</div>
                        
                        ${notification.metadata ? `
                            <div class="metadata">
                                <h4>Details:</h4>
                                ${Object.entries(notification.metadata).map(([key, value]) =>
        `<p><strong>${key}:</strong> ${value}</p>`
    ).join('')}
                            </div>
                        ` : ''}
                        
                        ${notification.data ? `
                            <div class="metadata">
                                <h4>Additional Information:</h4>
                                ${Object.entries(notification.data).map(([key, value]) =>
        `<p><strong>${key}:</strong> ${value}</p>`
    ).join('')}
                            </div>
                        ` : ''}
                        
                        ${notification.link ? `
                            <a href="${notification.link}" class="button">View Details</a>
                        ` : ''}
                    </div>
                    
                    <div class="footer">
                        <p>This notification was sent from your Real Estate CRM system.</p>
                        <p>Time: ${new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

const sendTestEmail = async (userEmail, notificationData) => {
    try {
        if (!transporter || !userEmail) {
            console.log('Email service not configured or no email provided');
            return false;
        }

        const mailOptions = {
            from: "tanjim11alam@gmail.com",
            to: userEmail,
            subject: 'Test Notification - Real Estate CRM',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1>🔔 Test Notification</h1>
                        <p>Real Estate CRM System</p>
                    </div>
                    <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Email Configuration Test</h2>
                        <p>This is a test email to verify that your notification email settings are working correctly.</p>
                        <p><strong>Notification Type:</strong> ${notificationData.type}</p>
                        <p><strong>Message:</strong> ${notificationData.message}</p>
                        <p><strong>Platform:</strong> ${notificationData.platform}</p>
                        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                            If you received this email, your notification settings are configured correctly!
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('Error sending test email:', error);
        return false;
    }
};

module.exports = {
    sendNotificationEmail,
    sendTestEmail
};