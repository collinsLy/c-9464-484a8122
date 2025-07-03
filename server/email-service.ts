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
  receiver: z.string().optional(),
  fromCurrency: z.string().optional(),
  toCurrency: z.string().optional(),
  conversionRate: z.number().positive().optional(),
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
    amount?: number
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
      <body style="background-color: hsl(215, 25%, 8%); color: hsl(0, 0%, 100%); font-family: Arial, sans-serif; margin: 0; padding: 40px 20px; min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background-color: hsl(215, 20%, 12%); border-radius: 12px; overflow: hidden; border: 1px solid hsl(215, 15%, 20%);">
          
          <!-- Header -->
          <div style="padding: 30px; border-bottom: 1px solid hsl(215, 15%, 20%); display: flex; align-items: center; gap: 15px;">
            <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.svg?v=040" alt="Vertex Trading Logo" style="height: 40px; width: auto;" />
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: hsl(0, 0%, 100%);">${this.brandName}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: hsl(0, 0%, 100%);">${title}</h2>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: hsl(0, 0%, 70%); line-height: 1.6;">Dear ${username},</p>
            
            <p style="margin: 0 0 30px 0; font-size: 16px; color: hsl(0, 0%, 70%); line-height: 1.6;">${message}</p>
            
            <!-- Status Badge -->
            <div style="display: inline-block; padding: 8px 16px; background-color: hsl(120, 60%, 50%); color: hsl(0, 0%, 100%); border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 30px;">
              COMPLETED
            </div>
            
            <!-- Transaction Details -->
            <div style="background-color: hsl(215, 15%, 18%); border: 1px solid hsl(215, 15%, 20%); border-radius: 8px; padding: 25px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 20px 0; font-size: 18px; color: hsl(60, 100%, 50%); font-weight: bold;">Transaction Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 70%); border-bottom: 1px solid hsl(215, 15%, 25%);">Transaction ID:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 100%); text-align: right; font-family: monospace; border-bottom: 1px solid hsl(215, 15%, 25%);">VTX-${Date.now()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 70%); border-bottom: 1px solid hsl(215, 15%, 25%);">Type:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 100%); text-align: right; font-family: monospace; border-bottom: 1px solid hsl(215, 15%, 25%); text-transform: capitalize;">${transactionType}</td>
                </tr>
                ${amount ? `
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 70%); border-bottom: 1px solid hsl(215, 15%, 25%);">Amount:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(60, 100%, 50%); text-align: right; font-family: monospace; border-bottom: 1px solid hsl(215, 15%, 25%); font-weight: bold;">$${amount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(0, 0%, 70%); border-bottom: 1px solid hsl(215, 15%, 25%);">Status:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: hsl(120, 60%, 50%); text-align: right; font-family: monospace; border-bottom: 1px solid hsl(215, 15%, 25%); font-weight: bold;">Completed</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 5px 0; font-size: 16px; color: hsl(60, 100%, 50%); font-weight: bold;">Timestamp:</td>
                  <td style="padding: 15px 0 5px 0; font-size: 16px; color: hsl(60, 100%, 50%); text-align: right; font-family: monospace; font-weight: bold;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin: 30px 0 0 0; font-size: 16px; color: hsl(0, 0%, 70%); line-height: 1.6;">
              Thank you for choosing ${this.brandName}. Your transaction has been processed successfully.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="#" style="display: inline-block; padding: 15px 30px; background-color: hsl(60, 100%, 50%); color: hsl(215, 25%, 8%); text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">${buttonText}</a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="padding: 30px; border-top: 1px solid hsl(215, 15%, 20%); background-color: hsl(215, 15%, 15%); text-align: center;">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: hsl(0, 0%, 70%); line-height: 1.5;">
              This email was sent by ${this.brandName}. For support, please contact us at 
              <a href="mailto:support@vertextrading.com" style="color: hsl(60, 100%, 50%); text-decoration: none;">support@vertextrading.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: hsl(0, 0%, 50%);">© ${currentYear} ${this.brandName}. All rights reserved.</p>
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
    receiver?: string,
    fromCurrency?: string,
    toCurrency?: string,
    conversionRate?: number
  ): EmailTemplate {
    const timestamp = new Date().toLocaleString();
    const templates = {
      withdrawal: {
        subject: `${this.brandName} Withdrawal Confirmation`,
        message: `Your withdrawal of $${amount.toLocaleString()} has been successfully processed and is now being transferred to your designated account. The funds should arrive within 1-3 business days.`,
        buttonText: 'View Transaction History',
        transactionType: 'withdrawal' as const,
      },
      deposit: {
        subject: `${this.brandName} Deposit Confirmation`,
        message: `Your deposit of $${amount.toLocaleString()} is now available in your ${this.brandName} account. You can start trading immediately with your deposited funds.`,
        buttonText: 'Start Trading Now',
        transactionType: 'deposit' as const,
      },
      transfer: {
        subject: `${this.brandName} Transfer Confirmation`,
        message: `Your transfer of $${amount.toLocaleString()} to ${receiver} has been successfully completed and processed.`,
        buttonText: 'View Transfer Details',
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
    const htmlContent = this.createModernTemplate(
      template.subject,
      username,
      template.message,
      template.buttonText,
      template.transactionType,
      amount
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
      const { to, username, type, amount, receiver, fromCurrency, toCurrency, conversionRate } = validatedData;

      const template = this.createEmailTemplate(
        username,
        type,
        amount,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate
      );

      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: template.subject,
        html: template.htmlContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
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

  async sendWelcomeEmail(data: z.infer<typeof WelcomeEmailSchema>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { to, username } = WelcomeEmailSchema.parse(data);

      const htmlContent = this.createModernTemplate(
        'Welcome to Vertex Trading',
        username,
        `Welcome to ${this.brandName}! We're excited to have you join our community of traders. Your account has been successfully created and is ready to use.`,
        'Get Started Trading',
        'deposit'
      );

      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: `Welcome to ${this.brandName}`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent successfully to ${to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
      };

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      
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