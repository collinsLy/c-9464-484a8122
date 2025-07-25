import nodemailer from 'nodemailer';
import { z } from 'zod';

// Validation schemas for messaging
const AdminMessageSchema = z.object({
  recipients: z.array(z.string().email()),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message body is required'),
  channel: z.enum(['email', 'in-app', 'push']),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  senderId: z.string().min(1, 'Sender ID is required'),
});

const SystemBroadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message body is required'),
  channel: z.enum(['email', 'in-app', 'push']),
  priority: z.enum(['low', 'normal', 'high']).optional().default('normal'),
  senderId: z.string().min(1, 'Sender ID is required'),
});

interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
  secure?: boolean;
  port?: number;
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  errors?: string[];
  deliveredTo: string[];
  failedTo: string[];
}

export class MessagingService {
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly brandName: string = 'Vertex Trading';

  constructor(config?: Partial<EmailConfig>) {
    this.fromEmail = process.env.EMAIL_USER || 'kelvinkelly3189@gmail.com';
    
    const emailConfig: EmailConfig = {
      service: 'gmail',
      auth: {
        user: this.fromEmail,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || 'zozj kjez thsb adhs',
      },
      secure: true,
      port: 465,
      ...config,
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  // Generate professional HTML template for admin messages
  private generateMessageHTML(subject: string, body: string, priority: string = 'normal'): string {
    const priorityColors = {
      low: '#22c55e',
      normal: '#3b82f6', 
      high: '#ef4444'
    };

    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || '#3b82f6';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 24px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.svg?v=040" alt="V-Systems" style="width: 40px; height: 40px; margin-right: 12px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">${this.brandName}</h1>
            </div>
            <div style="background-color: ${priorityColor}; color: white; padding: 6px 12px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${priority} Priority
            </div>
          </div>

          <!-- Content -->
          <div style="padding: 32px 24px;">
            <h2 style="color: #1e293b; margin: 0 0 24px 0; font-size: 20px; font-weight: 600; line-height: 1.3;">
              ${subject}
            </h2>
            
            <div style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              ${body.replace(/\n/g, '<br>')}
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.DOMAIN || 'https://vertextradingscom.vercel.app'}/dashboard" 
                 style="background: linear-gradient(135deg, ${priorityColor} 0%, ${priorityColor}dd 100%); 
                        color: #ffffff; 
                        text-decoration: none; 
                        padding: 14px 28px; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        display: inline-block; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        transition: all 0.3s ease;">
                Open Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">
              This message was sent by the ${this.brandName} Administration Team
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you have questions, please contact support through your dashboard.
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin-top: 16px;">
              <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 500;">
                🔒 Security Notice: This email contains important account information. 
                Never share your login credentials with anyone.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send targeted message to specific users
  async sendTargetedMessage(data: {
    recipients: string[];
    subject: string;
    body: string;
    channel: 'email' | 'in-app' | 'push';
    priority?: 'low' | 'normal' | 'high';
    senderId: string;
  }): Promise<MessageResult> {
    try {
      // Validate input
      const validated = AdminMessageSchema.parse(data);
      
      const result: MessageResult = {
        success: true,
        deliveredTo: [],
        failedTo: [],
        errors: []
      };

      // For email channel, send emails
      if (validated.channel === 'email') {
        const htmlContent = this.generateMessageHTML(
          validated.subject, 
          validated.body, 
          validated.priority
        );

        // Send emails in batches to avoid rate limits
        const batchSize = 10;
        for (let i = 0; i < validated.recipients.length; i += batchSize) {
          const batch = validated.recipients.slice(i, i + batchSize);
          
          for (const recipient of batch) {
            try {
              await this.transporter.sendMail({
                from: `"${this.brandName} Admin" <${this.fromEmail}>`,
                to: recipient,
                subject: `[${validated.priority?.toUpperCase()}] ${validated.subject}`,
                html: htmlContent,
                priority: validated.priority === 'high' ? 'high' : 'normal',
              });
              
              result.deliveredTo.push(recipient);
              console.log(`✅ Admin message sent to ${recipient}`);
            } catch (error) {
              console.error(`❌ Failed to send to ${recipient}:`, error);
              result.failedTo.push(recipient);
              result.errors?.push(`Failed to send to ${recipient}: ${error}`);
            }
          }
          
          // Small delay between batches
          if (i + batchSize < validated.recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // For in-app and push notifications (placeholder for future implementation)
      if (validated.channel === 'in-app' || validated.channel === 'push') {
        // TODO: Implement in-app and push notification logic
        console.log(`📱 ${validated.channel} notification would be sent to ${validated.recipients.length} users`);
        result.deliveredTo = validated.recipients;
      }

      result.success = result.failedTo.length === 0;
      return result;

    } catch (error) {
      console.error('Error in sendTargetedMessage:', error);
      return {
        success: false,
        deliveredTo: [],
        failedTo: data.recipients,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Send system-wide broadcast message
  async sendSystemBroadcast(data: {
    subject: string;
    body: string;
    channel: 'email' | 'in-app' | 'push';
    priority?: 'low' | 'normal' | 'high';
    senderId: string;
  }, allUserEmails: string[]): Promise<MessageResult> {
    try {
      // Validate input
      const validated = SystemBroadcastSchema.parse(data);
      
      console.log(`📢 Sending system broadcast to ${allUserEmails.length} users via ${validated.channel}`);
      
      return await this.sendTargetedMessage({
        recipients: allUserEmails,
        subject: `[SYSTEM] ${validated.subject}`,
        body: `🔔 System Broadcast\n\n${validated.body}`,
        channel: validated.channel,
        priority: validated.priority,
        senderId: validated.senderId
      });

    } catch (error) {
      console.error('Error in sendSystemBroadcast:', error);
      return {
        success: false,
        deliveredTo: [],
        failedTo: allUserEmails,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Send KYC status update notification
  async sendKYCStatusNotification(data: {
    userEmail: string;
    userName: string;
    status: 'approved' | 'rejected' | 'under_review';
    comments?: string;
    adminId: string;
  }): Promise<MessageResult> {
    try {
      const statusMessages = {
        approved: {
          subject: 'KYC Verification Approved - Access Granted',
          body: `Congratulations ${data.userName}!\n\nYour KYC verification has been successfully approved. You now have full access to all platform features.\n\n${data.comments ? `Admin Notes: ${data.comments}` : ''}`
        },
        rejected: {
          subject: 'KYC Verification - Additional Information Required',
          body: `Hello ${data.userName},\n\nWe need additional information to complete your KYC verification. Please review the feedback and resubmit your documents.\n\n${data.comments ? `Feedback: ${data.comments}` : 'Please ensure all documents are clear and valid.'}`
        },
        under_review: {
          subject: 'KYC Verification Under Review',
          body: `Hello ${data.userName},\n\nThank you for submitting your KYC documents. Your verification is currently under review and will be processed within 24-48 hours.\n\n${data.comments ? `Additional Notes: ${data.comments}` : ''}`
        }
      };

      const message = statusMessages[data.status];
      
      return await this.sendTargetedMessage({
        recipients: [data.userEmail],
        subject: message.subject,
        body: message.body,
        channel: 'email',
        priority: data.status === 'approved' ? 'high' : 'normal',
        senderId: data.adminId
      });

    } catch (error) {
      console.error('Error in sendKYCStatusNotification:', error);
      return {
        success: false,
        deliveredTo: [],
        failedTo: [data.userEmail],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Test email connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const messagingService = new MessagingService();