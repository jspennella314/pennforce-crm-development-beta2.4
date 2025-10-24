# Mass Email Blast Setup Guide

## Overview

Your PennForce CRM now has a complete mass email blast system integrated with EmailJS! This guide will help you configure and use the system.

## Features Implemented

✅ **Mailing List Management**
- Create and manage custom mailing lists
- Add/remove contacts from lists
- View contact counts and details

✅ **Email Campaign System**
- Create campaigns with HTML email content
- Use email templates with variable replacement
- Select recipients from mailing lists or individual contacts
- Schedule campaigns for future sending
- Send immediately or schedule for later
- Track send status for each recipient

✅ **Campaign Dashboard**
- View all campaigns with status filtering
- See campaign statistics (sent, failed, success rate)
- Monitor individual recipient status
- Track delivery errors

✅ **EmailJS Integration**
- Sends emails via EmailJS with info@pennjets.com
- Rate limiting to respect EmailJS limits
- Automatic variable replacement ({{firstName}}, {{lastName}}, etc.)

## Setup Instructions

### 1. Configure EmailJS Account

1. **Sign up or log in to EmailJS**: https://dashboard.emailjs.com/

2. **Create a new Email Service**:
   - Go to Email Services
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Note your **Service ID**

3. **Create an Email Template**:
   - Go to Email Templates
   - Click "Create New Template"
   - Use these template variables in your EmailJS template:
     ```
     To: {{to_email}}
     From: {{from_name}} <{{from_email}}>
     Subject: {{subject}}

     {{message}}
     ```
   - Note your **Template ID**

4. **Get your API Keys**:
   - Go to Account > API Keys
   - Note your **Public Key** and **Private Key**

### 2. Update Environment Variables

Edit your `.env` file and add your EmailJS credentials:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=your-service-id-here
EMAILJS_TEMPLATE_ID=your-template-id-here
EMAILJS_PUBLIC_KEY=your-public-key-here
EMAILJS_PRIVATE_KEY=your-private-key-here

# Cron Secret (for scheduled campaigns)
CRON_SECRET=change-this-to-a-random-secret-string
```

### 3. Set Up Cron Job for Scheduled Campaigns

To process scheduled campaigns, you need to set up a cron job that calls:

```
GET https://your-domain.com/api/cron/process-campaigns
Authorization: Bearer YOUR_CRON_SECRET
```

**Options:**

**A. Vercel Cron (Recommended for Vercel deployments)**

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/process-campaigns",
    "schedule": "* * * * *"
  }]
}
```

**B. External Cron Service**

Use services like:
- cron-job.org
- EasyCron
- GitHub Actions

Example GitHub Actions workflow (`.github/workflows/cron.yml`):
```yaml
name: Process Scheduled Campaigns
on:
  schedule:
    - cron: '* * * * *'  # Every minute
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Call cron endpoint
        run: |
          curl -X GET https://your-domain.com/api/cron/process-campaigns \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 4. Restart Your Application

```bash
npm run dev
```

## Usage Guide

### Creating a Mailing List

1. Navigate to `/mailing-lists`
2. Click "Create Mailing List"
3. Enter a name and optional description
4. Click "Create"
5. Click "Manage" to add contacts to the list

### Creating an Email Campaign

1. Navigate to `/email-campaigns`
2. Click "Create Campaign"

**Step 1: Email Content**
- Enter campaign name (internal reference)
- Enter subject line (supports variables like {{firstName}})
- Enter email body (HTML supported)
- Optionally select an email template
- Customize from name and email

**Step 2: Select Recipients**
- Choose to use a mailing list OR select individual contacts
- If using mailing list, select from dropdown
- If selecting contacts, check the contacts you want

**Step 3: Send or Schedule**
- Choose "Send Immediately" or "Schedule for Later"
- If scheduling, select date and time
- Review campaign summary
- Click "Create & Send" or "Create & Schedule"

### Variable Replacement

Use these variables in your subject and body:

- `{{firstName}}` - Contact's first name
- `{{lastName}}` - Contact's last name
- `{{name}}` - Contact's full name
- `{{email}}` - Contact's email
- `{{accountName}}` - Contact's account name

Example:
```html
<p>Hi {{firstName}},</p>
<p>Thank you for being a valued customer at {{accountName}}.</p>
```

### Monitoring Campaign Status

1. Navigate to `/email-campaigns`
2. Click on a campaign to view details
3. See recipient-level status:
   - **PENDING**: Not sent yet
   - **SENT**: Successfully sent
   - **FAILED**: Send failed (error message shown)
   - **BOUNCED**: Email bounced

### Campaign Status Meanings

- **DRAFT**: Campaign created but not sent
- **SCHEDULED**: Campaign scheduled for future send
- **SENDING**: Campaign currently being sent
- **SENT**: Campaign completed sending
- **FAILED**: Campaign failed to send
- **CANCELLED**: Scheduled campaign was cancelled

## Email Rate Limiting

The system includes a 1-second delay between emails to respect EmailJS rate limits. For large campaigns:

- 100 recipients = ~1.7 minutes
- 500 recipients = ~8.3 minutes
- 1000 recipients = ~16.7 minutes

You can adjust this in `app/lib/emailService.ts` (the `delayMs` parameter in `sendBulkEmails`).

## Navigation

Add links to your navigation menu:

```tsx
<Link href="/mailing-lists">Mailing Lists</Link>
<Link href="/email-campaigns">Email Campaigns</Link>
```

## Testing

### Test Campaign Workflow

1. Create a test mailing list with your own email
2. Create a test campaign:
   - Name: "Test Campaign"
   - Subject: "Hello {{firstName}}"
   - Body: "<p>Hi {{firstName}}, this is a test email from {{accountName}}.</p>"
   - Recipients: Your test mailing list
   - Send immediately

3. Check your email to verify:
   - Variables are replaced correctly
   - From address is info@pennjets.com
   - Email formatting looks correct

4. View the campaign in the dashboard to see send status

## Troubleshooting

### Emails Not Sending

1. **Check EmailJS credentials** in `.env`
2. **Verify EmailJS template** has correct variable mapping
3. **Check EmailJS dashboard** for error logs
4. **Check browser console** and server logs for errors
5. **Verify contacts have email addresses** (contacts without emails are skipped)

### Scheduled Campaigns Not Sending

1. **Verify cron job is running** and calling the endpoint
2. **Check CRON_SECRET** is set correctly
3. **Check server logs** for cron execution
4. **Verify scheduledFor date** is in the past

### Variables Not Replacing

1. **Ensure contacts have the required fields** (firstName, lastName, etc.)
2. **Use correct variable syntax**: `{{firstName}}` not `{firstName}`
3. **Check EmailJS template** is passing through the `message` variable

## API Endpoints

### Mailing Lists
- `GET /api/mailing-lists` - Get all lists
- `POST /api/mailing-lists` - Create list
- `GET /api/mailing-lists/[id]` - Get list with contacts
- `PATCH /api/mailing-lists/[id]` - Update list
- `DELETE /api/mailing-lists/[id]` - Delete list
- `POST /api/mailing-lists/[id]/contacts` - Add contacts
- `DELETE /api/mailing-lists/[id]/contacts` - Remove contacts

### Email Campaigns
- `GET /api/email-campaigns` - Get all campaigns
- `POST /api/email-campaigns` - Create campaign
- `GET /api/email-campaigns/[id]` - Get campaign details
- `PATCH /api/email-campaigns/[id]` - Update campaign
- `DELETE /api/email-campaigns/[id]` - Delete campaign
- `POST /api/email-campaigns/[id]/send` - Send campaign
- `POST /api/email-campaigns/[id]/schedule` - Schedule campaign
- `DELETE /api/email-campaigns/[id]/schedule` - Cancel schedule

### Cron
- `GET /api/cron/process-campaigns` - Process scheduled campaigns

## Database Models

The following models were added to your schema:

- **MailingList** - Stores mailing lists
- **MailingListContact** - Junction table for list-contact relationship
- **EmailCampaign** - Stores campaign details
- **CampaignRecipient** - Tracks individual recipient status
- **CampaignStatus** enum - DRAFT, SCHEDULED, SENDING, SENT, FAILED, CANCELLED
- **RecipientStatus** enum - PENDING, SENT, FAILED, BOUNCED

## Next Steps

1. **Configure EmailJS** with your credentials
2. **Test with a small mailing list** (your own email)
3. **Set up cron job** for scheduled campaigns
4. **Add navigation links** to your app
5. **Import your contacts** into the CRM
6. **Create your first mailing list**
7. **Send your first campaign!**

## Support

For issues or questions:
- Check EmailJS documentation: https://www.emailjs.com/docs/
- Review server logs for error messages
- Verify all environment variables are set correctly

---

**Ready to send your first mass email campaign!** 🚀
