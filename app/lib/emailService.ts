// EmailJS Service Integration for PennForce CRM
// Handles mass email sending using EmailJS with info@pennjets.com

import emailjs from '@emailjs/nodejs';

interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID || '';
    this.templateId = process.env.EMAILJS_TEMPLATE_ID || '';
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY || '';

    if (!this.serviceId || !this.templateId || !this.publicKey || !this.privateKey) {
      console.warn('EmailJS credentials not fully configured. Email sending will fail.');
    }
  }

  /**
   * Send a single email using EmailJS
   */
  async sendEmail(params: EmailParams): Promise<SendEmailResult> {
    try {
      if (!this.serviceId || !this.templateId || !this.publicKey || !this.privateKey) {
        return {
          success: false,
          error: 'EmailJS not configured. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in .env'
        };
      }

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        params,
        {
          publicKey: this.publicKey,
          privateKey: this.privateKey,
        }
      );

      return {
        success: true,
        messageId: response.text,
      };
    } catch (error: any) {
      console.error('EmailJS send error:', error);
      return {
        success: false,
        error: error.text || error.message || 'Unknown email sending error'
      };
    }
  }

  /**
   * Send bulk emails with rate limiting to avoid hitting EmailJS limits
   * EmailJS has rate limits, so we space out sends
   */
  async sendBulkEmails(
    recipients: Array<{ email: string; name: string }>,
    subject: string,
    message: string,
    fromName: string = 'PennJets',
    fromEmail: string = 'info@pennjets.com',
    onProgress?: (sent: number, total: number) => void,
    delayMs: number = 1000 // 1 second delay between emails
  ): Promise<Array<{ email: string; success: boolean; error?: string }>> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      const result = await this.sendEmail({
        to_email: recipient.email,
        to_name: recipient.name,
        from_name: fromName,
        from_email: fromEmail,
        subject,
        message,
      });

      results.push({
        email: recipient.email,
        success: result.success,
        error: result.error,
      });

      // Report progress
      if (onProgress) {
        onProgress(i + 1, recipients.length);
      }

      // Add delay between sends to respect rate limits (except for last email)
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Process variables in email content
   * Replaces {{variable}} placeholders with actual values
   */
  processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }

    return processed;
  }
}

// Export singleton instance
export const emailService = new EmailService();
