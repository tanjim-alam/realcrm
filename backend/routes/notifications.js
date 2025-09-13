
    const { email } = req.body;
    const notificationService = require('../services/notificationService');

    const testEmail = {
      to: email,
      subject: 'Test Notification - Real Estate CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Notification</h1>
              <p>Real Estate CRM</p>
            </div>
            <div class="content">
              <p>This is a test notification to verify that email notifications are working correctly.</p>
              <p>If you received this email, your notification settings are configured properly!</p>
            </div>
            <div class="footer">
              <p>This is a test notification from your Real Estate CRM system.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Test Notification - Real Estate CRM

This is a test notification to verify that email notifications are working correctly.

If you received this email, your notification settings are configured properly!

This is a test notification from your Real Estate CRM system.
      `
    };

    const result = await notificationService.sendEmail(testEmail);

    if (result.success) {
      res.json({ message: 'Test notification sent successfully', result });
    } else {
      res.status(400).json({ message: 'Failed to send test notification', error: result.error });
    }
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

    const { email } = req.body;
    const notificationService = require('../services/notificationService');

    const testEmail = {
      to: email,
      subject: 'Test Notification - Real Estate CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Test Notification</h1>
              <p>Real Estate CRM</p>
            </div>
            <div class="content">
              <p>This is a test notification to verify that email notifications are working correctly.</p>
              <p>If you received this email, your notification settings are configured properly!</p>
            </div>
            <div class="footer">
              <p>This is a test notification from your Real Estate CRM system.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Test Notification - Real Estate CRM

This is a test notification to verify that email notifications are working correctly.

If you received this email, your notification settings are configured properly!

This is a test notification from your Real Estate CRM system.
      `
    };

    const result = await notificationService.sendEmail(testEmail);

    if (result.success) {
      res.json({ message: 'Test notification sent successfully', result });
    } else {
      res.status(400).json({ message: 'Failed to send test notification', error: result.error });
    }
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
