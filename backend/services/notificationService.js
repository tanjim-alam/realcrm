const { sendEmail } = require('../config/email');
const NotificationSettings = require('../models/NotificationSettings');
const Company = require('../models/Company');

class NotificationService {
  constructor() {
    console.log('📧 Using existing email configuration from config/email.js');
  }

  async getNotificationSettings(companyId) {
    try {
      let settings = await NotificationSettings.findOne({ companyId });
      
      if (!settings) {
        // Create default settings if none exist
        settings = new NotificationSettings({
          companyId,
          email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com',
          notifications: {
            newLead: { enabled: true, email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com' },
            leadStatusChange: { enabled: true, email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com' },
            leadAssignment: { enabled: true, email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com' },
            dailySummary: { enabled: false, email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com', time: '09:00' },
            reminder: { enabled: true, email: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@yourcompany.com', advanceTime: 15 }
          }
        });
        await settings.save();
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  async sendNewLeadNotification(lead, company) {
    try {
      const settings = await this.getNotificationSettings(company._id);
      
      if (!settings || !settings.notifications?.newLead?.enabled || !settings.notifications?.newLead?.email) {
        console.log('📧 New lead notification skipped - not enabled or no email configured');
        return { success: false, message: 'Notification not enabled' };
      }

      const { subject, html, text } = this.generateNewLeadEmailContent(lead, company);
      
      const result = await sendEmail(
        settings.notifications.newLead.email,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ New lead notification sent successfully');
      } else {
        console.error('❌ Failed to send new lead notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending new lead notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLeadStatusChangeNotification(lead, oldStatus, newStatus, company) {
    try {
      const settings = await this.getNotificationSettings(company._id);
      
      if (!settings || !settings.notifications?.leadStatusChange?.enabled || !settings.notifications?.leadStatusChange?.email) {
        console.log('📧 Status change notification skipped - not enabled or no email configured');
        return { success: false, message: 'Notification not enabled' };
      }

      const { subject, html, text } = this.generateLeadStatusChangeEmailContent(lead, oldStatus, newStatus, company);
      
      const result = await sendEmail(
        settings.notifications.leadStatusChange.email,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ Lead status change notification sent successfully');
      } else {
        console.error('❌ Failed to send status change notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending lead status change notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLeadAssignmentNotification(lead, assignedToUser, company) {
    try {
      const settings = await this.getNotificationSettings(company._id);
      
      if (!settings || !settings.notifications?.leadAssignment?.enabled || !settings.notifications?.leadAssignment?.email) {
        console.log('📧 Assignment notification skipped - not enabled or no email configured');
        return { success: false, message: 'Notification not enabled' };
      }

      const { subject, html, text } = this.generateLeadAssignmentEmailContent(lead, assignedToUser, company);
      
      const result = await sendEmail(
        settings.notifications.leadAssignment.email,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ Lead assignment notification sent successfully');
      } else {
        console.error('❌ Failed to send assignment notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending lead assignment notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendReminderNotification(lead, company) {
    try {
      const settings = await this.getNotificationSettings(company._id);
      
      if (!settings || !settings.notifications?.reminder?.enabled || !settings.notifications?.reminder?.email) {
        console.log('📧 Reminder notification skipped - not enabled or no email configured');
        return { success: false, message: 'Notification not enabled' };
      }

      const { subject, html, text } = this.generateReminderEmailContent(lead, company);
      
      const result = await sendEmail(
        settings.notifications.reminder.email,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ Reminder notification sent successfully');
      } else {
        console.error('❌ Failed to send reminder notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendReminderConfirmationNotification(lead, company) {
    try {
      const settings = await this.getNotificationSettings(company._id);
      
      if (!settings || !settings.notifications?.reminder?.enabled || !settings.notifications?.reminder?.email) {
        console.log('📧 Reminder confirmation notification skipped - not enabled or no email configured');
        return { success: false, message: 'Notification not enabled' };
      }

      const { subject, html, text } = this.generateReminderConfirmationEmailContent(lead, company);
      
      const result = await sendEmail(
        settings.notifications.reminder.email,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ Reminder confirmation notification sent successfully');
      } else {
        console.error('❌ Failed to send reminder confirmation notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending reminder confirmation notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestNotification(recipientEmail, company) {
    try {
      const subject = `Test Notification from ${company.name} CRM`;
      const html = this.generateTestEmailHTML(company);
      const text = this.generateTestEmailText(company);
      
      const result = await sendEmail(
        recipientEmail,
        subject,
        html,
        text,
        { name: company.name, email: company.email }
      );

      if (result.success) {
        console.log('✅ Test notification sent successfully');
      } else {
        console.error('❌ Failed to send test notification:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { success: false, error: error.message };
    }
  }

  generateNewLeadEmailContent(lead, company) {
    const subject = `New Lead Alert: ${lead.name} from ${lead.source || 'Unknown'}`;
    const html = this.generateNewLeadEmailHTML(lead, company);
    const text = this.generateNewLeadEmailText(lead, company);
    return { subject, html, text };
  }

  generateLeadStatusChangeEmailContent(lead, oldStatus, newStatus, company) {
    const subject = `Lead Status Update: ${lead.name} - ${newStatus.toUpperCase()}`;
    const html = this.generateLeadStatusChangeEmailHTML(lead, oldStatus, newStatus, company);
    const text = this.generateLeadStatusChangeEmailText(lead, oldStatus, newStatus, company);
    return { subject, html, text };
  }

  generateLeadAssignmentEmailContent(lead, assignedToUser, company) {
    const subject = `Lead Assignment: ${lead.name} assigned to ${assignedToUser.name}`;
    const html = this.generateLeadAssignmentEmailHTML(lead, assignedToUser, company);
    const text = this.generateLeadAssignmentEmailText(lead, assignedToUser, company);
    return { subject, html, text };
  }

  generateReminderEmailContent(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const subject = `⏰ Reminder: Follow up with ${lead.name}`;
    const html = this.generateReminderEmailHTML(lead, company);
    const text = this.generateReminderEmailText(lead, company);
    return { subject, html, text };
  }

  generateReminderConfirmationEmailContent(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const subject = `✅ Reminder Set: Follow up with ${lead.name}`;
    const html = this.generateReminderConfirmationEmailHTML(lead, company);
    const text = this.generateReminderConfirmationEmailText(lead, company);
    return { subject, html, text };
  }

  generateNewLeadEmailHTML(lead, company) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .lead-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { flex: 1; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-new { background: #e3f2fd; color: #1976d2; }
          .priority-hot { color: #d32f2f; font-weight: bold; }
          .priority-warm { color: #f57c00; font-weight: bold; }
          .priority-cold { color: #1976d2; font-weight: bold; }
          .priority-ice { color: #616161; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Lead Alert!</h1>
            <p>A new lead has been added to your CRM system</p>
          </div>
          
          <div class="lead-details">
            <h3>Lead Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value"><strong>${lead.name}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${lead.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${lead.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Source:</div>
              <div class="detail-value">${lead.source || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">
                <span class="status-badge status-new">${lead.status}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Project:</div>
              <div class="detail-value">${lead.projectName || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Budget:</div>
              <div class="detail-value">${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Property Type:</div>
              <div class="detail-value">${lead.propertyType || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Created:</div>
              <div class="detail-value">${new Date(lead.createdAt).toLocaleString()}</div>
            </div>
            ${lead.scoring ? `
            <div class="detail-row">
              <div class="detail-label">Lead Score:</div>
              <div class="detail-value">
                <strong>${lead.scoring.score}/${lead.scoring.maxScore}</strong>
                <span class="priority-${lead.scoring.priority}">(${lead.scoring.priority.toUpperCase()})</span>
              </div>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/leads" class="cta-button">
              View Lead in CRM
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is an automated notification from your Real Estate CRM system.</p>
            <p>Please log in to your CRM to view more details and take action on this lead.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateNewLeadEmailText(lead, company) {
    return `
New Lead Alert: ${lead.name} from ${lead.source || 'Unknown'}

A new lead has been added to your CRM system for ${company.name}.

LEAD DETAILS:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Source: ${lead.source || 'Not specified'}
Status: ${lead.status}
Project: ${lead.projectName || 'Not specified'}
Budget: ${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
Property Type: ${lead.propertyType || 'Not specified'}
Created: ${new Date(lead.createdAt).toLocaleString()}
${lead.scoring ? `Lead Score: ${lead.scoring.score}/${lead.scoring.maxScore} (${lead.scoring.priority.toUpperCase()})` : ''}

Please log in to your CRM to view more details and take action on this lead.

Company: ${company.name}
This is an automated notification from your Real Estate CRM system.
    `;
  }

  generateLeadStatusChangeEmailHTML(lead, oldStatus, newStatus, company) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lead Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .status-change { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .old-status { color: #666; text-decoration: line-through; }
          .new-status { color: #4caf50; font-weight: bold; font-size: 18px; }
          .lead-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { flex: 1; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Lead Status Updated</h1>
            <p>The status for lead ${lead.name} has been changed</p>
          </div>
          
          <div class="status-change">
            <p>Status changed from <span class="old-status">${oldStatus}</span> to <span class="new-status">${newStatus}</span></p>
          </div>
          
          <div class="lead-details">
            <h3>Lead Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value"><strong>${lead.name}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${lead.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${lead.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Updated:</div>
              <div class="detail-value">${new Date().toLocaleString()}</div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is an automated notification from your Real Estate CRM system.</p>
            <p>Please log in to your CRM to view more details.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateLeadStatusChangeEmailText(lead, oldStatus, newStatus, company) {
    return `
Lead Status Update: ${lead.name} - ${newStatus.toUpperCase()}

The status for lead ${lead.name} in your CRM for ${company.name} has been updated.

STATUS CHANGE:
From: ${oldStatus}
To: ${newStatus}

LEAD DETAILS:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Updated: ${new Date().toLocaleString()}

Please log in to your CRM to view more details.

Company: ${company.name}
This is an automated notification from your Real Estate CRM system.
    `;
  }

  generateLeadAssignmentEmailHTML(lead, assignedToUser, company) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lead Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .assignment-info { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .assigned-to { color: #f57c00; font-weight: bold; font-size: 18px; }
          .lead-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { flex: 1; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👤 Lead Assigned</h1>
            <p>Lead ${lead.name} has been assigned to a team member</p>
          </div>
          
          <div class="assignment-info">
            <p>Assigned to: <span class="assigned-to">${assignedToUser.name}</span></p>
            <p>Email: ${assignedToUser.email}</p>
            <p>Assigned on: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="lead-details">
            <h3>Lead Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value"><strong>${lead.name}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${lead.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${lead.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">${lead.status}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Project:</div>
              <div class="detail-value">${lead.projectName || 'Not specified'}</div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is an automated notification from your Real Estate CRM system.</p>
            <p>Please log in to your CRM to view more details and manage this lead.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateLeadAssignmentEmailText(lead, assignedToUser, company) {
    return `
Lead Assignment: ${lead.name} assigned to ${assignedToUser.name}

Lead ${lead.name} in your CRM for ${company.name} has been assigned to ${assignedToUser.name}.

ASSIGNMENT DETAILS:
Assigned to: ${assignedToUser.name}
Email: ${assignedToUser.email}
Assigned on: ${new Date().toLocaleString()}

LEAD DETAILS:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Status: ${lead.status}
Project: ${lead.projectName || 'Not specified'}

Please log in to your CRM to view more details and manage this lead.

Company: ${company.name}
This is an automated notification from your Real Estate CRM system.
    `;
  }

  generateTestEmailHTML(company) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .success-message { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .checkmark { color: #4caf50; font-size: 48px; margin-bottom: 10px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Test Email Successful!</h1>
            <p>Your email notification system is working correctly</p>
          </div>
          
          <div class="success-message">
            <div class="checkmark">✓</div>
            <h3>Email Configuration Verified</h3>
            <p>This is a test email from your <strong>${company.name}</strong> CRM notification system.</p>
            <p>If you received this email, your notification settings are properly configured and working.</p>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is a test notification from your Real Estate CRM system.</p>
            <p>You can now receive automated notifications for new leads, status changes, and assignments.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateTestEmailText(company) {
    return `
Test Email Successful!

This is a test email from your ${company.name} CRM notification system.

✓ Email Configuration Verified

If you received this email, your notification settings are properly configured and working.

You can now receive automated notifications for:
- New leads added to the CRM
- Lead status changes
- Lead assignments to team members

Company: ${company.name}
This is a test notification from your Real Estate CRM system.
    `;
  }

  generateReminderEmailHTML(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const timeUntilReminder = this.getTimeUntilReminder(lead.reminder.date);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .reminder-alert { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #ff6b35; }
          .reminder-time { color: #ff6b35; font-weight: bold; font-size: 18px; }
          .reminder-message { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
          .lead-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { flex: 1; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Reminder Alert!</h1>
            <p>It's time to follow up with a lead</p>
          </div>
          
          <div class="reminder-alert">
            <h3>Reminder Time: <span class="reminder-time">${reminderTime}</span></h3>
            <p>${timeUntilReminder}</p>
            ${lead.reminder.message ? `
            <div class="reminder-message">
              <strong>Reminder Note:</strong> ${lead.reminder.message}
            </div>
            ` : ''}
          </div>
          
          <div class="lead-details">
            <h3>Lead Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value"><strong>${lead.name}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${lead.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${lead.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">${lead.status}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Project:</div>
              <div class="detail-value">${lead.projectName || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Budget:</div>
              <div class="detail-value">${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Property Type:</div>
              <div class="detail-value">${lead.propertyType || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Source:</div>
              <div class="detail-value">${lead.source || 'Not specified'}</div>
            </div>
            ${lead.assignedTo ? `
            <div class="detail-row">
              <div class="detail-label">Assigned To:</div>
              <div class="detail-value">${lead.assignedTo.name}</div>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/leads" class="cta-button">
              View Lead in CRM
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is an automated reminder from your Real Estate CRM system.</p>
            <p>Please log in to your CRM to view more details and take action on this lead.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateReminderEmailText(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const timeUntilReminder = this.getTimeUntilReminder(lead.reminder.date);
    
    return `
⏰ REMINDER: Follow up with ${lead.name}

It's time to follow up with a lead in your CRM for ${company.name}.

REMINDER DETAILS:
Reminder Time: ${reminderTime}
${timeUntilReminder}
${lead.reminder.message ? `Reminder Note: ${lead.reminder.message}` : ''}

LEAD DETAILS:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Status: ${lead.status}
Project: ${lead.projectName || 'Not specified'}
Budget: ${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
Property Type: ${lead.propertyType || 'Not specified'}
Source: ${lead.source || 'Not specified'}
${lead.assignedTo ? `Assigned To: ${lead.assignedTo.name}` : ''}

Please log in to your CRM to view more details and take action on this lead.

Company: ${company.name}
This is an automated reminder from your Real Estate CRM system.
    `;
  }

  getTimeUntilReminder(reminderDate) {
    const now = new Date();
    const reminder = new Date(reminderDate);
    const diffMs = reminder - now;
    
    if (diffMs < 0) {
      return 'This reminder is overdue!';
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `Reminder is in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Reminder is in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Reminder is in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  generateReminderConfirmationEmailHTML(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const timeUntilReminder = this.getTimeUntilReminder(lead.reminder.date);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .confirmation-alert { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #4caf50; }
          .reminder-time { color: #4caf50; font-weight: bold; font-size: 18px; }
          .reminder-message { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
          .lead-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { flex: 1; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          .cta-button { display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Reminder Set Successfully!</h1>
            <p>Your reminder has been scheduled and you'll be notified when it's due</p>
          </div>
          
          <div class="confirmation-alert">
            <h3>Reminder Scheduled for: <span class="reminder-time">${reminderTime}</span></h3>
            <p>${timeUntilReminder}</p>
            ${lead.reminder.message ? `
            <div class="reminder-message">
              <strong>Reminder Note:</strong> ${lead.reminder.message}
            </div>
            ` : ''}
          </div>
          
          <div class="lead-details">
            <h3>Lead Information</h3>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value"><strong>${lead.name}</strong></div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${lead.email}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${lead.phone || 'Not provided'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">${lead.status}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Project:</div>
              <div class="detail-value">${lead.projectName || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Budget:</div>
              <div class="detail-value">${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Property Type:</div>
              <div class="detail-value">${lead.propertyType || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Source:</div>
              <div class="detail-value">${lead.source || 'Not specified'}</div>
            </div>
            ${lead.assignedTo ? `
            <div class="detail-row">
              <div class="detail-label">Assigned To:</div>
              <div class="detail-value">${lead.assignedTo.name}</div>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/leads" class="cta-button">
              View Lead in CRM
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Company:</strong> ${company.name}</p>
            <p>This is a confirmation from your Real Estate CRM system.</p>
            <p>You will receive another notification when the reminder is due.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateReminderConfirmationEmailText(lead, company) {
    const reminderTime = new Date(lead.reminder.date).toLocaleString();
    const timeUntilReminder = this.getTimeUntilReminder(lead.reminder.date);
    
    return `
✅ REMINDER SET: Follow up with ${lead.name}

Your reminder has been successfully scheduled in your CRM for ${company.name}.

REMINDER DETAILS:
Scheduled for: ${reminderTime}
${timeUntilReminder}
${lead.reminder.message ? `Reminder Note: ${lead.reminder.message}` : ''}

LEAD DETAILS:
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Status: ${lead.status}
Project: ${lead.projectName || 'Not specified'}
Budget: ${lead.budget ? `$${lead.budget.toLocaleString()}` : 'Not specified'}
Property Type: ${lead.propertyType || 'Not specified'}
Source: ${lead.source || 'Not specified'}
${lead.assignedTo ? `Assigned To: ${lead.assignedTo.name}` : ''}

You will receive another notification when the reminder is due.

Company: ${company.name}
This is a confirmation from your Real Estate CRM system.
    `;
  }
}

module.exports = new NotificationService();



