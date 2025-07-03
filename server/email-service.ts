
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
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${title}</title>
        <style>
          /* Reset and Base Styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #ffffff;
            background: #0a0a0a;
          }
          
          /* Email Container */
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          
          /* Header Section */
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          
          .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 
              0 0 10px rgba(255, 255, 255, 0.5),
              0 0 20px rgba(102, 126, 234, 0.5),
              0 0 30px rgba(102, 126, 234, 0.3);
            position: relative;
            z-index: 1;
          }
          
          .status-badge {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50px;
            padding: 8px 20px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
            position: relative;
            z-index: 1;
          }
          
          /* Content Section */
          .content {
            padding: 40px 30px;
            background: #1a1a1a;
            position: relative;
          }
          
          .content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
          }
          
          .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          
          .message {
            font-size: 16px;
            color: #b3b3b3;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          
          /* Transaction Details Card */
          .transaction-card {
            background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%);
            border: 1px solid rgba(102, 126, 234, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
            position: relative;
            overflow: hidden;
            box-shadow: 
              0 10px 30px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(102, 126, 234, 0.1);
          }
          
          .transaction-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .transaction-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 15px;
            text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
          }
          
          .transaction-title {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          }
          
          .transaction-amount {
            font-size: 32px;
            font-weight: 800;
            color: #00ff88;
            text-shadow: 
              0 0 10px rgba(0, 255, 136, 0.5),
              0 0 20px rgba(0, 255, 136, 0.3);
            margin-bottom: 15px;
          }
          
          /* Glow Button */
          .glow-button {
            display: inline-block;
            background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 700;
            text-align: center;
            box-shadow: 
              0 0 20px rgba(102, 126, 234, 0.4),
              0 0 40px rgba(102, 126, 234, 0.2),
              0 10px 30px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          
          .glow-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          .glow-button:hover::before {
            left: 100%;
          }
          
          .glow-button:hover {
            box-shadow: 
              0 0 30px rgba(102, 126, 234, 0.6),
              0 0 60px rgba(102, 126, 234, 0.4),
              0 15px 40px rgba(0, 0, 0, 0.4);
            transform: translateY(-2px);
          }
          
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          
          /* Security Notice */
          .security-notice {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            color: #ffc107;
            font-size: 14px;
            box-shadow: 0 0 15px rgba(255, 193, 7, 0.1);
          }
          
          .security-notice strong {
            color: #ffffff;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          }
          
          /* Footer */
          .footer {
            background: #0a0a0a;
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(102, 126, 234, 0.2);
          }
          
          .footer-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .footer-links {
            margin-bottom: 20px;
          }
          
          .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .footer-links a:hover {
            color: #ffffff;
            text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
          }
          
          .copyright {
            font-size: 12px;
            color: #444;
            margin-top: 20px;
          }
          
          /* Responsive Design */
          @media (max-width: 600px) {
            .email-container {
              margin: 0 10px;
            }
            
            .header,
            .content,
            .footer {
              padding: 25px 20px;
            }
            
            .logo {
              font-size: 28px;
            }
            
            .greeting {
              font-size: 20px;
            }
            
            .transaction-amount {
              font-size: 24px;
            }
            
            .glow-button {
              padding: 16px 30px;
              font-size: 14px;
            }
          }
          
          /* Dark Mode Enhancements */
          @media (prefers-color-scheme: dark) {
            .email-container {
              background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            }
            
            .content {
              background: #1a1a1a;
            }
            
            .footer {
              background: #0a0a0a;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header Section -->
          <div class="header">
            <div class="logo">VERTEX TRADING</div>
            <div class="status-badge">${statusIcon} ${transactionType.toUpperCase()}</div>
          </div>
          
          <!-- Content Section -->
          <div class="content">
            <h1 class="greeting">Hello ${username}!</h1>
            <p class="message">${message}</p>
            
            <!-- Transaction Card -->
            <div class="transaction-card">
              <div class="transaction-icon">${statusIcon}</div>
              <div class="transaction-title">${title}</div>
              <div class="transaction-amount">Transaction Confirmed</div>
            </div>
            
            <!-- Action Button -->
            <div class="button-container">
              <a href="#" class="glow-button">${buttonText}</a>
            </div>
            
            <!-- Security Notice -->
            <div class="security-notice">
              <strong>Security Notice:</strong> This email contains sensitive transaction information. 
              Please verify all details and contact support if you notice any discrepancies.
            </div>
          </div>
          
          <!-- Footer Section -->
          <div class="footer">
            <p class="footer-text">Stay connected with Vertex Trading</p>
            <div class="footer-links">
              <a href="#">Dashboard</a>
              <a href="#">Support</a>
              <a href="#">Settings</a>
            </div>
            <p class="copyright">© ${currentYear} Vertex Trading. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
