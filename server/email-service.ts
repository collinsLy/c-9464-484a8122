import nodemailer from 'nodemailer';
import { z } from 'zod';

// Type definitions
interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
  secure?: boolean;
  port?: number;
}

interface EmailTemplate {
  subject: string;
  message: string;
  htmlContent: string;
  buttonText: string;
  transactionType: TransactionType;
}

type TransactionType = 'withdrawal' | 'deposit' | 'transfer' | 'conversion';

// Validation schemas
const TransactionEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
  type: z.enum(['withdrawal', 'deposit', 'transfer', 'conversion']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  receiver: z.string().optional(),
  fromCurrency: z.string().optional(),
  toCurrency: z.string().optional(),
  conversionRate: z.number().positive().optional(),
  isReceiver: z.boolean().optional(),
});

const WelcomeEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
});

// Email service class
export class EmailService {
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
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  private getStatusIcon(type: TransactionType): string {
    const icons = {
      deposit: '✓',
      withdrawal: '↗',
      transfer: '→',
      conversion: '⇄',
    } as const;
    
    return icons[type];
  }

  private createModernTemplate(
    title: string,
    username: string,
    message: string,
    buttonText: string,
    transactionType: TransactionType,
    amount?: number,
    currency?: string,
    isReceiver?: boolean
  ): string {
    const statusIcon = this.getStatusIcon(transactionType);
    const currentYear = new Date().getFullYear();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
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
            <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${title}</h2>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">Dear ${username},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">${message}</p>
            
            <!-- Status Badge -->
            <div style="display: inline-block; padding: 8px 16px; background-color: #4caf50; color: #ffffff; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 30px;">
              ${transactionType === 'transfer' && isReceiver ? 'FUNDS RECEIVED' : 'COMPLETED'}
            </div>
            
            <!-- Transaction Details -->
            <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #ff7a00; font-weight: bold;">Transaction Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Transaction ID:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0;">VTX-${Date.now()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Type:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; text-transform: capitalize;">${transactionType === 'transfer' ? (isReceiver ? 'Transfer Received' : 'Transfer Sent') : transactionType}</td>
                </tr>
                ${amount ? `
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Amount:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #ff7a00; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; font-weight: bold;">${amount.toLocaleString()} ${currency}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Status:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #4caf50; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Completed</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 5px 0; font-size: 16px; color: #1a1a1a; font-weight: bold;">Timestamp:</td>
                  <td style="padding: 15px 0 5px 0; font-size: 16px; color: #1a1a1a; text-align: right; font-family: monospace; font-weight: bold;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: #555555; line-height: 1.6;">
              Thank you for choosing ${this.brandName}. Your transaction has been processed successfully.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://vertextradingscom.vercel.app/" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #ff7a00 0%, #ff9a40 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);">${buttonText}</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 30px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9; text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; line-height: 1.5;">
              This email was sent by ${this.brandName}. For support, please contact us at 
              <a href="mailto:support@vertextrading.com" style="color: #ff7a00; text-decoration: none;">support@vertextrading.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #999999;">© ${currentYear} ${this.brandName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private createEmailTemplate(
    username: string,
    type: TransactionType,
    amount: number,
    currency: string,
    receiver?: string,
    fromCurrency?: string,
    toCurrency?: string,
    conversionRate?: number,
    isReceiver?: boolean
  ): EmailTemplate {
    console.log(`📧 Creating email template - Type: ${type}, isReceiver: ${isReceiver}, Username: ${username}, Receiver: ${receiver}`);
    const timestamp = new Date().toLocaleString();
    const templates = {
      withdrawal: {
        subject: `${this.brandName} Withdrawal Confirmation`,
        message: `Your withdrawal of ${amount.toLocaleString()} ${currency} has been successfully processed and is now being transferred to your designated account. The funds should arrive within 5-10 Minutes.`,
        buttonText: 'View Transaction History',
        transactionType: 'withdrawal' as const,
      },
      deposit: {
        subject: `${this.brandName} Deposit Confirmation`,
        message: `Your deposit of ${amount.toLocaleString()} ${currency} is now available in your ${this.brandName} account. You can start trading immediately with your deposited funds.`,
        buttonText: 'Start Trading Now',
        transactionType: 'deposit' as const,
      },
      transfer: {
        subject: isReceiver 
          ? `${this.brandName} - Funds Received`
          : `${this.brandName} - Transfer Sent Successfully`,
        message: isReceiver 
          ? `Great news! You have received ${amount.toLocaleString()} ${currency} from ${receiver}. The funds have been added to your ${this.brandName} account and are available for immediate use.`
          : `Your transfer of ${amount.toLocaleString()} ${currency} to ${receiver} has been successfully completed. The funds have been deducted from your account and transferred to the recipient.`,
        buttonText: isReceiver ? 'View Your Balance' : 'View Transfer History',
        transactionType: 'transfer' as const,
      },
      conversion: {
        subject: `${this.brandName} Currency Conversion Completed`,
        message: `Your currency conversion of ${amount.toLocaleString()} ${fromCurrency} to ${toCurrency} has been completed at a rate of ${conversionRate}. The converted amount is now available in your account.`,
        buttonText: 'View Conversion Details',
        transactionType: 'conversion' as const,
      },
    };

    const template = templates[type];
    console.log(`📧 Template selected - Subject: ${template.subject}, Message: ${template.message}, isReceiver: ${isReceiver}`);
    
    const htmlContent = this.createModernTemplate(
      template.subject,
      username,
      template.message,
      template.buttonText,
      template.transactionType,
      amount,
      currency,
      isReceiver
    );

    return {
      ...template,
      htmlContent,
    };
  }

  // Public API methods
  async sendTransactionEmail(data: z.infer<typeof TransactionEmailSchema>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const validatedData = TransactionEmailSchema.parse(data);
      let { to, username, type, amount, currency, receiver, fromCurrency, toCurrency, conversionRate, isReceiver } = validatedData;
      
      // Ensure isReceiver is a boolean
      isReceiver = Boolean(isReceiver);
      
      console.log(`📨 sendTransactionEmail called - To: ${to}, Type: ${type}, isReceiver: ${isReceiver} (type: ${typeof isReceiver})`);

      const template = this.createEmailTemplate(
        username,
        type,
        amount,
        currency,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate,
        isReceiver
      );

      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        replyTo: `"${this.brandName} Support" <support@vertextrading.com>`,
        to,
        subject: template.subject,
        html: template.htmlContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Return-Path': this.fromEmail,
        },
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ ${type} email sent successfully to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
      };

    } catch (error) {
      console.error(`❌ Failed to send ${data.type} email:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sendWelcomeEmail(data: z.infer<typeof WelcomeEmailSchema>): Promise<{ success: boolean; messageId?: string; error?: string; deliveryInfo?: any }> {
    try {
      console.log('📧 Attempting to send welcome email to:', data.to || data.email);
      const { to, username } = WelcomeEmailSchema.parse(data);

      // Test connection first
      console.log('🔍 Testing SMTP connection...');
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');

      const htmlContent = this.createModernTemplate(
        'Welcome to Vertex Trading',
        username,
        `Welcome to ${this.brandName}! We're excited to have you join our community of traders. Your account has been successfully created and is ready to use. To get started, please verify your email address using the verification link sent by Firebase Authentication, then return to your dashboard to begin trading.`,
        'Access Your Dashboard',
        'deposit'
      );

      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        replyTo: `"${this.brandName} Support" <support@vertextrading.com>`,
        to,
        subject: `Welcome to ${this.brandName} - Verify Your Account`,
        html: htmlContent,
        text: `Welcome to ${this.brandName}!\n\nWelcome ${username}! We're excited to have you join our community of traders. Your account has been successfully created and is ready to use.\n\nTo get started, please verify your email address using the verification link sent by Firebase Authentication, then return to your dashboard to begin trading.\n\nThank you for choosing ${this.brandName}.\n\nBest regards,\nThe ${this.brandName} Team`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Return-Path': this.fromEmail,
          'Message-ID': `<${Date.now()}-${Math.random().toString(36).substr(2, 9)}@${this.fromEmail.split('@')[1]}>`,
        },
        dsn: {
          id: `vtx-${Date.now()}`,
          return: 'headers',
          notify: ['failure', 'delay', 'success'],
          recipient: this.fromEmail
        }
      };

      console.log('📧 Sending welcome email with options:', { 
        to, 
        subject: mailOptions.subject, 
        from: mailOptions.from,
        messageId: mailOptions.headers['Message-ID']
      });
      
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Welcome email sent successfully to ${to}`);
      console.log(`📬 Message ID: ${result.messageId}`);
      console.log(`📊 Response: ${result.response}`);
      console.log(`🎯 Accepted: ${JSON.stringify(result.accepted)}`);
      console.log(`❌ Rejected: ${JSON.stringify(result.rejected)}`);
      console.log(`⏳ Pending: ${JSON.stringify(result.pending)}`);
      
      return {
        success: true,
        messageId: result.messageId,
        deliveryInfo: {
          response: result.response,
          accepted: result.accepted,
          rejected: result.rejected,
          pending: result.pending
        }
      };

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      console.error('❌ Error details:', error instanceof Error ? error.stack : error);
      
      // Check specific error types
      if (error instanceof Error) {
        if (error.message.includes('Invalid login')) {
          console.error('🔐 Authentication failed - check Gmail app password');
        } else if (error.message.includes('Daily sending quota exceeded')) {
          console.error('📊 Gmail sending limit reached');
        } else if (error.message.includes('Recipient address rejected')) {
          console.error('📧 Invalid recipient email address');
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connection test passed');
      return true;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  close(): void {
    this.transporter.close();
    console.log('📪 Email service closed');
  }
}

export const emailService = new EmailService();

// Export types for external use
export type { TransactionType, EmailConfig };
export { TransactionEmailSchema, WelcomeEmailSchema };