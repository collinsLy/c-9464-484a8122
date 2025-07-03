
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
  private readonly brandName: string = 'VERTEX TRADING';

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

    this.transporter = nodemailer.createTransporter(emailConfig);
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
    transactionType: TransactionType
  ): string {
    const statusIcon = this.getStatusIcon(transactionType);
    const currentYear = new Date().getFullYear();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.brandName} - ${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary-color: #008080;
                  --primary-light: #20b2aa;
                  --primary-dark: #006666;
                  --accent-color: #f2ff44;
                  --text-primary: #181a20;
                  --text-secondary: #474d57;
                  --text-muted: #707a8a;
                  --background: #f7f8fa;
                  --surface: #ffffff;
                  --surface-secondary: #f8fffe;
                  --border: #eaecef;
                  --border-light: #f1f4f6;
                  --success: #10b981;
                  --warning: #f59e0b;
                  --error: #ef4444;
                  --shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                  --radius: 12px;
                  --radius-lg: 16px;
              }

              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: var(--text-primary);
                  background: var(--background);
                  -webkit-font-smoothing: antialiased;
                  -moz-osx-font-smoothing: grayscale;
              }
              
              .email-container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: var(--surface);
                  border-radius: var(--radius-lg);
                  overflow: hidden;
                  box-shadow: var(--shadow);
                  border: 1px solid var(--border);
              }
              
              .header {
                  background: linear-gradient(135deg, #0c0c0f 0%, #181a20 50%, #1e2329 100%);
                  padding: 32px 40px;
                  position: relative;
                  overflow: hidden;
              }
              
              .header::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  background: radial-gradient(circle at 80% 20%, rgba(242, 255, 68, 0.1) 0%, transparent 50%);
              }
              
              .logo-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  position: relative;
                  z-index: 1;
              }
              
              .logo {
                  width: 40px;
                  height: 40px;
                  filter: brightness(1.2);
              }
              
              .brand-name {
                  color: var(--accent-color);
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 0.5px;
              }
              
              .status-header {
                  text-align: center;
                  padding: 32px 40px;
                  background: linear-gradient(180deg, var(--surface-secondary) 0%, var(--surface) 100%);
                  border-bottom: 1px solid var(--border-light);
              }
              
              .status-icon {
                  width: 72px;
                  height: 72px;
                  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
                  border-radius: 50%;
                  margin: 0 auto 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 32px;
                  color: white;
                  box-shadow: 0 8px 24px rgba(0, 128, 128, 0.25);
              }
              
              .status-title {
                  font-size: 28px;
                  font-weight: 700;
                  color: var(--text-primary);
                  margin-bottom: 8px;
                  letter-spacing: -0.5px;
              }
              
              .status-subtitle {
                  font-size: 16px;
                  color: var(--text-muted);
                  font-weight: 500;
              }
              
              .content {
                  padding: 40px;
              }
              
              .greeting {
                  font-size: 18px;
                  color: var(--text-primary);
                  margin-bottom: 24px;
                  font-weight: 500;
              }
              
              .message {
                  font-size: 16px;
                  color: var(--text-secondary);
                  margin-bottom: 32px;
                  line-height: 1.7;
              }
              
              .amount {
                  font-weight: 700;
                  color: var(--primary-color);
                  background: rgba(0, 128, 128, 0.1);
                  padding: 4px 8px;
                  border-radius: 6px;
                  font-size: 0.95em;
              }
              
              .cta-section {
                  text-align: center;
                  margin: 40px 0;
              }
              
              .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
                  color: white;
                  padding: 18px 36px;
                  text-decoration: none;
                  border-radius: 10px;
                  font-weight: 600;
                  font-size: 16px;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: 0 4px 16px rgba(0, 128, 128, 0.25);
                  letter-spacing: 0.3px;
                  border: none;
              }
              
              .cta-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 24px rgba(0, 128, 128, 0.35);
                  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
              }
              
              .info-card {
                  background: var(--surface-secondary);
                  border: 1px solid #e1f5f5;
                  border-radius: var(--radius);
                  padding: 24px;
                  margin: 24px 0;
              }
              
              .info-title {
                  font-size: 15px;
                  font-weight: 600;
                  color: var(--primary-color);
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
              }
              
              .info-text {
                  font-size: 14px;
                  color: var(--text-secondary);
                  line-height: 1.6;
              }
              
              .security-notice {
                  background: #fff8e6;
                  border: 1px solid var(--warning);
                  border-radius: var(--radius);
                  padding: 24px;
                  margin: 24px 0;
              }
              
              .security-title {
                  font-size: 15px;
                  font-weight: 600;
                  color: #ad6700;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
              }
              
              .security-text {
                  font-size: 14px;
                  color: #8b6914;
                  line-height: 1.6;
              }
              
              .link {
                  color: var(--primary-color);
                  text-decoration: none;
                  font-weight: 600;
                  transition: color 0.2s ease;
              }
              
              .link:hover {
                  color: var(--primary-dark);
                  text-decoration: underline;
              }
              
              .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%);
                  margin: 32px 0;
              }
              
              .footer {
                  background: var(--surface-secondary);
                  padding: 32px 40px;
                  text-align: center;
                  border-top: 1px solid var(--border-light);
              }
              
              .footer-text {
                  font-size: 15px;
                  color: var(--text-muted);
                  margin-bottom: 8px;
              }
              
              .footer-brand {
                  font-size: 14px;
                  color: var(--primary-color);
                  font-weight: 600;
                  margin-bottom: 16px;
              }
              
              .footer-disclaimer {
                  font-size: 12px;
                  color: #9ca3af;
                  line-height: 1.5;
                  margin-top: 16px;
              }
              
              .footer-copyright {
                  font-size: 12px;
                  color: #9ca3af;
                  margin-top: 8px;
              }
              
              @media (max-width: 640px) {
                  .email-container {
                      margin: 20px 16px;
                      border-radius: var(--radius);
                  }
                  
                  .header, .content, .footer, .status-header {
                      padding-left: 24px;
                      padding-right: 24px;
                  }
                  
                  .content {
                      padding: 32px 24px;
                  }
                  
                  .status-header {
                      padding: 24px;
                  }
                  
                  .status-title {
                      font-size: 24px;
                  }
                  
                  .brand-name {
                      font-size: 20px;
                  }
                  
                  .logo {
                      width: 36px;
                      height: 36px;
                  }
                  
                  .status-icon {
                      width: 64px;
                      height: 64px;
                      font-size: 28px;
                  }
                  
                  .cta-button {
                      padding: 16px 32px;
                      font-size: 15px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <div class="logo-container">
                      <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.svg?v=040" alt="${this.brandName}" class="logo">
                      <div class="brand-name">${this.brandName}</div>
                  </div>
              </div>
              
              <div class="status-header">
                  <div class="status-icon">${statusIcon}</div>
                  <h1 class="status-title">${title}</h1>
                  <p class="status-subtitle">Transaction completed successfully</p>
              </div>
              
              <div class="content">
                  <p class="greeting">Hello ${username},</p>
                  
                  <div class="message">${message}</div>
                  
                  <div class="cta-section">
                      <a href="#" class="cta-button">${buttonText}</a>
                  </div>
                  
                  <div class="info-card">
                      <div class="info-title">
                          <span>💡</span>
                          Need Help?
                      </div>
                      <p class="info-text">
                          Visit our <a href="#" class="link">Help Center</a> or read our <a href="#" class="link">FAQs</a> for more information about your transaction.
                      </p>
                  </div>
                  
                  <div class="security-notice">
                      <div class="security-title">
                          <span>🔒</span>
                          Security Notice
                      </div>
                      <p class="security-text">
                          Don't recognize this activity? Please <a href="#" class="link">reset your password</a> and <a href="#" class="link">contact support</a> immediately.
                      </p>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <p class="footer-disclaimer">
                      This is an automated message from ${this.brandName}. Please do not reply to this email.
                  </p>
              </div>
              
              <div class="footer">
                  <p class="footer-text">Thank you for choosing ${this.brandName}</p>
                  <p class="footer-brand">Your trusted crypto trading platform</p>
                  <p class="footer-copyright">© ${currentYear} ${this.brandName}. All rights reserved.</p>
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
        message: `Your withdrawal of <span class="amount">$${amount.toLocaleString()}</span> has been successfully processed and is now being transferred to your designated account. The funds should arrive within 1-3 business days.`,
        buttonText: 'View Transaction History',
        transactionType: 'withdrawal' as const,
      },
      deposit: {
        subject: `${this.brandName} Deposit Confirmation`,
        message: `Your deposit of <span class="amount">$${amount.toLocaleString()}</span> is now available in your ${this.brandName} account. You can start trading immediately with your deposited funds.`,
        buttonText: 'Start Trading Now',
        transactionType: 'deposit' as const,
      },
      transfer: {
        subject: `${this.brandName} Transfer Confirmation`,
        message: `Your transfer of <span class="amount">$${amount.toLocaleString()}</span> to ${receiver} has been successfully completed and processed.`,
        buttonText: 'View Transfer Details',
        transactionType: 'transfer' as const,
      },
      conversion: {
        subject: `${this.brandName} Currency Conversion Confirmation`,
        message: (() => {
          const convertedAmount = conversionRate ? (amount * conversionRate).toFixed(6) : 'N/A';
          return `Your conversion of <span class="amount">${amount} ${fromCurrency}</span> to <span class="amount">${convertedAmount} ${toCurrency}</span> has been completed at rate ${conversionRate}.`;
        })(),
        buttonText: 'View Conversion History',
        transactionType: 'conversion' as const,
      },
    };

    const template = templates[type];
    const title = template.subject.replace(`${this.brandName} `, '');
    
    return {
      ...template,
      htmlContent: this.createModernTemplate(title, username, template.message, template.buttonText, template.transactionType),
    };
  }

  async sendTransactionEmail(
    to: string,
    username: string,
    type: 'withdrawal' | 'deposit' | 'transfer' | 'conversion',
    amount: number,
    receiver?: string,
    fromCurrency?: string,
    toCurrency?: string,
    conversionRate?: number
  ) {
    try {
      // Validate input
      const validatedParams = TransactionEmailSchema.parse({
        to,
        username,
        type,
        amount,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate,
      });

      // Create email template
      const emailTemplate = this.createEmailTemplate(
        username,
        type,
        amount,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate
      );

      // Prepare mail options
      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.htmlContent,
        priority: 'high' as const,
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ ${type} email sent successfully to ${to}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        type,
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Error sending ${type} email:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        type,
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendWelcomeEmail(to: string, username: string) {
    try {
      // Validate input
      const validatedParams = WelcomeEmailSchema.parse({ to, username });

      // Create welcome email content
      const htmlContent = this.createModernTemplate(
        'Welcome to Vertex Trading!',
        username,
        `Welcome to ${this.brandName}! Your account has been successfully created. You can now start trading cryptocurrencies, manage your portfolio, and access our advanced trading features. Experience professional-grade trading tools and real-time market data.`,
        'Start Trading Now',
        'deposit'
      );

      const mailOptions = {
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: `Welcome to ${this.brandName}!`,
        html: htmlContent,
        priority: 'normal' as const,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Welcome email sent successfully to ${to}:`, result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        type: 'welcome',
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'welcome',
        recipient: to,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendBulkEmails(emails: Array<{ type: 'transaction' | 'welcome'; params: any }>) {
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        if (email.type === 'transaction') {
          return this.sendTransactionEmail(
            email.params.to,
            email.params.username,
            email.params.type,
            email.params.amount,
            email.params.receiver,
            email.params.fromCurrency,
            email.params.toCurrency,
            email.params.conversionRate
          );
        } else {
          return this.sendWelcomeEmail(email.params.to, email.params.username);
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`📊 Bulk email results: ${successful} successful, ${failed} failed`);
    
    return {
      total: results.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' }),
    };
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
