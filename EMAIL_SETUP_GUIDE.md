# 📧 Email Notifications Setup Guide

## Quick Setup

To enable email notifications in your Real Estate CRM, you need to configure SMTP settings.

### 1. Create Environment File

Create a `.env` file in the `backend` directory with the following content:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Configuration (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Real Estate CRM

# Default notification email
DEFAULT_NOTIFICATION_EMAIL=admin@yourcompany.com

# Server
PORT=8080
NODE_ENV=development
```

### 2. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as `SMTP_PASS` (not your regular password)

#### Step 3: Update Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME=Your Company Name
```

### 3. Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

### 4. Test Email Configuration

1. Start your server: `npm run dev`
2. Go to the Notifications page in your CRM
3. Enter your email address
4. Click "Send Test Email"
5. Check your inbox for the test email

### 5. Troubleshooting

#### Common Issues:

**"Email service not configured"**
- Check that all SMTP environment variables are set
- Restart the server after adding environment variables

**"Authentication failed"**
- For Gmail: Use App Password, not regular password
- Check that 2FA is enabled
- Verify email and password are correct

**"Connection timeout"**
- Check SMTP_HOST and SMTP_PORT
- Ensure firewall allows outbound connections on port 587
- Try port 465 with `secure: true` for some providers

**"Invalid credentials"**
- Double-check SMTP_USER and SMTP_PASS
- For Gmail: Make sure you're using App Password
- Test credentials with email client first

### 6. Security Notes

- Never commit `.env` file to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific configuration
- Regularly rotate your App Passwords

### 7. Production Setup

For production, set these environment variables in your hosting platform:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
SMTP_FROM_NAME=Your Company Name
DEFAULT_NOTIFICATION_EMAIL=admin@yourcompany.com
```

## Testing

After configuration, you should see:
- ✅ "Email service is ready to send messages" in server logs
- Test emails should be delivered to your inbox
- New lead notifications should work automatically

## Support

If you're still having issues:
1. Check server logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a different email provider
4. Check firewall and network settings
### Method 1: Create a Test Campaign
1. Go to **Email Campaigns** in your CRM
2. Create a new campaign
3. Select a template
4. Choose "All Leads" as recipients
5. Click **Send**

### Method 2: Test with Your Email
1. Make sure you have a lead with email `tanjim11alam@gmail.com`
2. Create a campaign targeting that lead
3. Send the campaign
4. Check your email inbox

## 📊 Monitor Email Status

### Check Email Logs
1. Go to **Analytics** → **Email Campaigns**
2. View campaign statistics
3. Check individual email status

### Backend Logs
Check the backend console for email sending logs:
```
Sending 1 emails...
Email sent successfully: <message-id>
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Invalid login" Error
- **Cause**: Wrong email or app password
- **Fix**: Double-check EMAIL_USER and EMAIL_APP_PASSWORD

#### 2. "Less secure app access" Error
- **Cause**: 2FA not enabled or wrong password type
- **Fix**: Use App Password, not regular password

#### 3. "Connection timeout" Error
- **Cause**: Network or Gmail server issues
- **Fix**: Check internet connection, try again later

#### 4. Emails in Spam Folder
- **Cause**: Gmail's spam filter
- **Fix**: Mark as "Not Spam" and add to contacts

## 📈 Email Performance

### Rate Limits
- **Gmail**: 100 emails per day (free), 2000 per day (paid)
- **Delay**: 2 seconds between emails to avoid rate limiting

### Best Practices
1. **Start small**: Test with 1-2 leads first
2. **Monitor delivery**: Check spam folders
3. **Use professional content**: Avoid spam trigger words
4. **Personalize**: Use lead names and company info

## 🔄 Alternative Email Services

If Gmail doesn't work, you can use:

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

## ✅ Verification Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Environment variables updated
- [ ] Backend server restarted
- [ ] Test campaign created
- [ ] Email received in inbox
- [ ] Email logs show "sent" status

## 🎯 Next Steps

Once emails are working:
1. **Create professional templates**
2. **Set up automated campaigns**
3. **Monitor performance metrics**
4. **Optimize based on results**

---

**Need Help?** Check the backend console logs for detailed error messages!

### Backend Logs
Check the backend console for email sending logs:
```
Sending 1 emails...
Email sent successfully: <message-id>
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Invalid login" Error
- **Cause**: Wrong email or app password
- **Fix**: Double-check EMAIL_USER and EMAIL_APP_PASSWORD

#### 2. "Less secure app access" Error
- **Cause**: 2FA not enabled or wrong password type
- **Fix**: Use App Password, not regular password

#### 3. "Connection timeout" Error
- **Cause**: Network or Gmail server issues
- **Fix**: Check internet connection, try again later

#### 4. Emails in Spam Folder
- **Cause**: Gmail's spam filter
- **Fix**: Mark as "Not Spam" and add to contacts

## 📈 Email Performance

### Rate Limits
- **Gmail**: 100 emails per day (free), 2000 per day (paid)
- **Delay**: 2 seconds between emails to avoid rate limiting

### Best Practices
1. **Start small**: Test with 1-2 leads first
2. **Monitor delivery**: Check spam folders
3. **Use professional content**: Avoid spam trigger words
4. **Personalize**: Use lead names and company info

## 🔄 Alternative Email Services

If Gmail doesn't work, you can use:

### SendGrid
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Mailgun
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

## ✅ Verification Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] Environment variables updated
- [ ] Backend server restarted
- [ ] Test campaign created
- [ ] Email received in inbox
- [ ] Email logs show "sent" status

## 🎯 Next Steps

Once emails are working:
1. **Create professional templates**
2. **Set up automated campaigns**
3. **Monitor performance metrics**
4. **Optimize based on results**

---

**Need Help?** Check the backend console logs for detailed error messages!

- Test emails should be delivered to your inbox
- New lead notifications should work automatically

## Support

If you're still having issues:
1. Check server logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a different email provider
4. Check firewall and network settings