import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
}

export interface TemplateEmailOptions {
  to: string | string[];
  templateId: string;
  dynamicTemplateData: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly defaultFrom: string;
  private readonly isEnabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const defaultFrom = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const isEnabled = this.configService.get<string>('SENDGRID_ENABLED');

    // Check if SendGrid is enabled (useful for development/testing)
    this.isEnabled = isEnabled !== 'false';

    if (!apiKey && this.isEnabled) {
      this.logger.warn(
        'SENDGRID_API_KEY is not set. Email sending will be disabled.',
      );
      this.isEnabled = false;
    }

    if (!defaultFrom && this.isEnabled) {
      this.logger.warn(
        'SENDGRID_FROM_EMAIL is not set. You must provide a "from" address for each email.',
      );
    }

    this.defaultFrom = defaultFrom || '';

    if (apiKey && this.isEnabled) {
      sgMail.setApiKey(apiKey);

      // Uncomment the line below if you are sending mail using a regional EU subuser
      // sgMail.setDataResidency('eu');

      this.logger.log('SendGrid email service initialized successfully');
    } else {
      this.logger.warn('SendGrid email service is disabled');
    }
  }

  /**
   * Send a simple email with text and/or HTML content
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn(
        `Email sending is disabled. Would have sent email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      );
      return;
    }

    try {
      const msg = {
        to: options.to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.attachments && { attachments: options.attachments }),
      } as sgMail.MailDataRequired;

      if (!msg.from) {
        throw new Error(
          'No "from" email address provided. Set SENDGRID_FROM_EMAIL or provide it in options.',
        );
      }

      await sgMail.send(msg);

      this.logger.log(
        `Email sent successfully to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      );
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send an email using a SendGrid dynamic template
   */
  async sendTemplateEmail(options: TemplateEmailOptions): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn(
        `Email sending is disabled. Would have sent template email to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      );
      return;
    }

    try {
      const msg: sgMail.MailDataRequired = {
        to: options.to,
        from: options.from || this.defaultFrom,
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData,
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
      };

      if (!msg.from) {
        throw new Error(
          'No "from" email address provided. Set SENDGRID_FROM_EMAIL or provide it in options.',
        );
      }

      await sgMail.send(msg);

      this.logger.log(
        `Template email sent successfully to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
      );
    } catch (error) {
      this.logger.error('Failed to send template email', error);
      throw new Error(
        `Failed to send template email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send multiple emails at once
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn(
        `Email sending is disabled. Would have sent ${emails.length} emails`,
      );
      return;
    }

    try {
      const messages = emails.map((options) => ({
        to: options.to,
        from: options.from || this.defaultFrom,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.attachments && { attachments: options.attachments }),
      })) as sgMail.MailDataRequired[];

      await sgMail.send(messages);

      this.logger.log(`Successfully sent ${emails.length} emails`);
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      throw new Error(
        `Failed to send bulk emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Send a welcome email (example helper method)
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Visualizar!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining us. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>The Visualizar Team</p>
      </div>
    `;

    const text = `
      Welcome to Visualizar!
      
      Hi ${userName},
      
      Thank you for joining us. We're excited to have you on board!
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The Visualizar Team
    `;

    await this.sendEmail({
      to,
      subject: 'Welcome to Visualizar!',
      html,
      text,
    });
  }
}
