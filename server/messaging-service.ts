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

  // Generate HTML email template matching transaction email design exactly
  private generateMessageHTML(subject: string, body: string, priority: string = 'normal', templateType: string = 'general'): string {
    const currentYear = new Date().getFullYear();
    
    // Use exact same template structure as transaction emails
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="background-color: #f5f5f5; color: #333333; font-family: Arial, sans-serif; margin: 0; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="padding: 30px; border-bottom: 1px solid #e0e0e0; text-align: center;">
            <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.png?v=040" alt="V-Systems Logo" style="height: 50px; width: auto; margin-bottom: 15px;" />
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">${this.brandName}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${subject}</h2>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">Dear User,</p>
            
            <!-- Priority Badge -->
            <div style="display: inline-block; padding: 8px 16px; background-color: #4caf50; color: #ffffff; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 30px;">
              ${priority.toUpperCase()} PRIORITY
            </div>
            
            ${this.generateTemplateContent(body, templateType)}
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #555555; line-height: 1.6;">
              Thank you for choosing ${this.brandName}. This message has been sent by the administration team.
            </p>
            
            <!-- Simple Link -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; color: #555555;">
                <a href="https://vertextradingscom.vercel.app/" style="color: #ff7a00; text-decoration: none;">Visit your dashboard</a>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 30px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; line-height: 1.5;">
              This email was sent by the ${this.brandName} Administration Team. 
              For support, contact <a href="mailto:support@vertextrading.com" style="color: #ff7a00; text-decoration: none;">support@vertextrading.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #999999;">
              If you did not expect this email, please contact our support team. © ${currentYear} ${this.brandName}.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate content based on template type with simple design matching transaction emails
  private generateTemplateContent(body: string, templateType: string): string {
    const processedBody = body.replace(/\n/g, '<br>').replace(/{{username}}/g, '[Username]');
    
    // Simple content structure matching transaction emails
    return `
      <div style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        ${processedBody}
      </div>
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
        // Detect template type based on subject/content
        let templateType = 'general';
        const subjectLower = validated.subject.toLowerCase();
        const bodyLower = validated.body.toLowerCase();
        
        if (subjectLower.includes('security') || subjectLower.includes('alert') || bodyLower.includes('security')) {
          templateType = 'security';
        } else if (subjectLower.includes('welcome') || bodyLower.includes('welcome')) {
          templateType = 'welcome';
        } else if (subjectLower.includes('maintenance') || bodyLower.includes('maintenance')) {
          templateType = 'maintenance';
        } else if (subjectLower.includes('offer') || subjectLower.includes('promotion') || bodyLower.includes('promotion')) {
          templateType = 'promotion';
        }

        const htmlContent = this.generateMessageHTML(
          validated.subject, 
          validated.body, 
          validated.priority,
          templateType
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

  // Send KYC status update notification with enhanced templates
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
          subject: '✅ KYC Verification Approved - Full Access Granted',
          body: `Congratulations ${data.userName}!\n\nGreat news! Your KYC verification has been successfully approved. You now have full access to all Vertex Trading platform features.\n\n🎉 What's now available to you:\n• Unlimited withdrawals\n• Access to premium trading features\n• Priority customer support\n• Enhanced security features\n• Participation in exclusive offers\n\n${data.comments ? `📝 Admin Notes: ${data.comments}\n\n` : ''}Thank you for completing your verification. Welcome to the full Vertex Trading experience!\n\nStart trading with confidence now.`,
          templateType: 'welcome'
        },
        rejected: {
          subject: '📋 KYC Verification - Additional Documentation Required',
          body: `Hello ${data.userName},\n\nThank you for submitting your KYC documents. Unfortunately, we need additional information to complete your verification.\n\n📌 Next Steps:\n• Review the feedback below\n• Prepare the requested documents\n• Resubmit through your dashboard\n• Our team will review within 24-48 hours\n\n${data.comments ? `💬 Specific Feedback: ${data.comments}\n\n` : ''}📋 General Requirements:\n• Documents must be clear and legible\n• Information must match your account details\n• Files should be in JPG, PNG, or PDF format\n\nNeed help? Our support team is ready to assist you through the verification process.`,
          templateType: 'security'
        },
        under_review: {
          subject: '⏳ KYC Verification Under Review',
          body: `Hello ${data.userName},\n\nThank you for submitting your KYC documents. Your verification is currently under review by our security team.\n\n⏱️ Review Process:\n• Current Status: Under Review\n• Expected Timeline: 24-48 hours\n• You'll be notified via email once complete\n• No action required from you at this time\n\n${data.comments ? `📝 Additional Notes: ${data.comments}\n\n` : ''}🔍 What we're reviewing:\n• Identity document verification\n• Address confirmation\n• Account information matching\n\nWe appreciate your patience as we ensure the security of all accounts on our platform.`,
          templateType: 'maintenance'
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