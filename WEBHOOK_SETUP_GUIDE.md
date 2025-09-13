# Webhook API Setup Guide

## Step 1: Set up Backend Environment Variable

1. **Create or update your `backend/.env` file** with the following:

```env
# Add this line to your backend/.env file
WEBHOOK_API_KEY=your_secure_webhook_key_here_12345
```

**Example:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/realestate_crm
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
WEBHOOK_API_KEY=sk_webhook_2024_secure_key_12345
```

2. **Restart your backend server** after adding the environment variable:
```bash
cd backend
npm run dev
```

## Step 2: Get Your Company ID

1. **Login to your CRM** as an admin
2. **Go to the Lead Integration page** (in the sidebar)
3. **Copy your Company ID** from the integration code
4. **Or check your browser's developer tools** when logged in to see the company ID in API calls

## Step 3: Update the Sample Landing Page

1. **Open `sample-landing-page.html`**
2. **Update the CONFIG section** with your actual values:

```javascript
const CONFIG = {
    apiUrl: 'http://localhost:5000/api/webhooks/leads',
    companyId: 'YOUR_ACTUAL_COMPANY_ID', // Get this from your CRM
    apiKey: 'your_secure_webhook_key_here_12345', // Same as in backend/.env
    source: 'website'
};
```

## Step 4: Test the Integration

1. **Open the sample landing page** in your browser
2. **Fill out the form** with test data
3. **Submit the form**
4. **Check your CRM** to see if the lead appears
5. **Check the browser console** for any error messages

## Troubleshooting

### "Invalid API key" Error
- Make sure `WEBHOOK_API_KEY` in `backend/.env` matches the `apiKey` in your landing page
- Restart your backend server after changing the environment variable

### "Company not found" Error
- Make sure the `companyId` in your landing page matches your actual company ID
- Check that your company is active in the database

### CORS Error
- Make sure your backend is running on port 5000
- Check that the CORS configuration allows your frontend domain

### Connection Error
- Make sure your backend server is running
- Check that the API URL is correct (should be port 5000, not 8080)

## Example Working Configuration

```javascript
const CONFIG = {
    apiUrl: 'http://localhost:5000/api/webhooks/leads',
    companyId: '507f1f77bcf86cd799439011', // Your actual company ID
    apiKey: 'sk_webhook_2024_secure_key_12345', // Same as WEBHOOK_API_KEY in backend/.env
    source: 'website'
};
```

## Security Notes

- **Never commit your `.env` file** to version control
- **Use a strong, unique API key** in production
- **Consider implementing proper API key validation** with database storage
- **Use HTTPS in production** for secure data transmission
