
import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use environment variables for email configuration
    const emailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'kelvinkelly3189@gmail.com',
        pass: process.env.EMAIL_PASS || 'zozj kjez thsb adhs'
      }
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  private createModernTemplate(title: string, username: string, message: string, buttonText: string, transactionType?: string): string {
    const getStatusIcon = (type?: string) => {
      switch (type) {
        case 'deposit': return '✓';
        case 'withdrawal': return '↗';
        case 'transfer': return '→';
        case 'conversion': return '⇄';
        default: return '✓';
      }
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vertex Trading - ${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.5;
                  color: #181a20;
                  background: #f7f8fa;
                  -webkit-font-smoothing: antialiased;
              }
              
              .email-container {
                  max-width: 560px;
                  margin: 40px auto;
                  background: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                  border: 1px solid #eaecef;
              }
              
              .header {
                  background: linear-gradient(135deg, #0c0c0f 0%, #181a20 50%, #1e2329 100%);
                  padding: 32px 40px 24px;
                  position: relative;
                  overflow: hidden;
              }
              
              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
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
                  width: 36px;
                  height: 36px;
                  filter: brightness(1.2);
              }
              
              .brand-name {
                  color: #f2ff44;
                  font-size: 20px;
                  font-weight: 700;
                  letter-spacing: 0.5px;
              }
              
              .status-header {
                  text-align: center;
                  padding: 28px 40px 32px;
                  background: linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
                  border-bottom: 1px solid #f1f4f6;
              }
              
              .status-icon {
                  width: 64px;
                  height: 64px;
                  background: linear-gradient(135deg, #008080 0%, #20b2aa 100%);
                  border-radius: 50%;
                  margin: 0 auto 16px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 28px;
                  color: white;
                  box-shadow: 0 8px 24px rgba(0, 128, 128, 0.25);
              }
              
              .status-title {
                  font-size: 24px;
                  font-weight: 700;
                  color: #181a20;
                  margin-bottom: 8px;
                  letter-spacing: -0.3px;
              }
              
              .status-subtitle {
                  font-size: 15px;
                  color: #707a8a;
                  font-weight: 500;
              }
              
              .content {
                  padding: 32px 40px;
              }
              
              .greeting {
                  font-size: 16px;
                  color: #181a20;
                  margin-bottom: 24px;
                  font-weight: 500;
              }
              
              .message {
                  font-size: 15px;
                  color: #474d57;
                  margin-bottom: 32px;
                  line-height: 1.6;
              }
              
              .amount {
                  font-weight: 700;
                  color: #008080;
                  background: rgba(0, 128, 128, 0.1);
                  padding: 2px 6px;
                  border-radius: 4px;
              }
              
              .cta-section {
                  text-align: center;
                  margin: 32px 0;
              }
              
              .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #008080 0%, #20b2aa 100%);
                  color: #ffffff;
                  padding: 16px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 15px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 16px rgba(0, 128, 128, 0.25);
                  letter-spacing: 0.3px;
              }
              
              .cta-button:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 6px 20px rgba(0, 128, 128, 0.35);
                  background: linear-gradient(135deg, #006666 0%, #1a9d9d 100%);
              }
              
              .info-card {
                  background: #f8fffe;
                  border: 1px solid #e1f5f5;
                  border-radius: 12px;
                  padding: 20px;
                  margin: 24px 0;
              }
              
              .info-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #008080;
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
              }
              
              .info-text {
                  font-size: 14px;
                  color: #474d57;
                  line-height: 1.5;
              }
              
              .security-notice {
                  background: #fff8e6;
                  border: 1px solid #ffd60a;
                  border-radius: 12px;
                  padding: 20px;
                  margin: 24px 0;
              }
              
              .security-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #ad6700;
                  margin-bottom: 8px;
                  display: flex;
                  align-items: center;
                  gap: 6px;
              }
              
              .security-text {
                  font-size: 14px;
                  color: #8b6914;
                  line-height: 1.5;
              }
              
              .link {
                  color: #008080;
                  text-decoration: none;
                  font-weight: 600;
              }
              
              .link:hover {
                  text-decoration: underline;
              }
              
              .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent 0%, #eaecef 50%, transparent 100%);
                  margin: 32px 0;
              }
              
              .footer {
                  background: #f8fffe;
                  padding: 24px 40px;
                  text-align: center;
                  border-top: 1px solid #f1f4f6;
              }
              
              .footer-text {
                  font-size: 14px;
                  color: #707a8a;
                  margin-bottom: 12px;
              }
              
              .footer-brand {
                  font-size: 13px;
                  color: #008080;
                  font-weight: 600;
              }
              
              .footer-disclaimer {
                  font-size: 12px;
                  color: #9ca3af;
                  margin-top: 16px;
                  line-height: 1.4;
              }
              
              @media (max-width: 600px) {
                  .email-container {
                      margin: 20px 16px;
                      border-radius: 12px;
                  }
                  
                  .header, .content, .footer, .status-header {
                      padding-left: 24px;
                      padding-right: 24px;
                  }
                  
                  .status-title {
                      font-size: 20px;
                  }
                  
                  .brand-name {
                      font-size: 18px;
                  }
                  
                  .logo {
                      width: 32px;
                      height: 32px;
                  }
                  
                  .status-icon {
                      width: 56px;
                      height: 56px;
                      font-size: 24px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="header">
                  <div class="logo-container">
                      <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.svg?v=040" alt="Vertex Trading" class="logo">
                      <div class="brand-name">VERTEX TRADING</div>
                  </div>
              </div>
              
              <div class="status-header">
                  <div class="status-icon">${getStatusIcon(transactionType)}</div>
                  <h1 class="status-title">${title}</h1>
                  <p class="status-subtitle">Transaction completed successfully</p>
              </div>
              
              <div class="content">
                  <p class="greeting">Hello ${username},</p>
                  
                  <p class="message">${message}</p>
                  
                  <div class="cta-section">
                      <a href="#" class="cta-button">${buttonText}</a>
                  </div>
                  
                  <div class="info-card">
                      <div class="info-title">
                          <span>ℹ️</span>
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
                      This is an automated message from Vertex Trading. Please do not reply to this email.
                  </p>
              </div>
              
              <div class="footer">
                  <p class="footer-text">Thank you for choosing Vertex Trading</p>
                  <p class="footer-brand">Your trusted crypto trading platform</p>
              </div>
          </div>
      </body>
      </html>
    `;
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
    const subject = `Vertex ${type.charAt(0).toUpperCase() + type.slice(1)} Confirmation`;
    
    let message = '';
    let htmlContent = '';

    switch (type) {
      case 'withdrawal':
        message = `Hello ${username},\n\nYour withdrawal of $${amount.toLocaleString()} has been successfully processed on ${new Date().toLocaleString()}.\n\nThe funds should arrive in your account within 1-3 business days.`;
        htmlContent = this.createModernTemplate('Withdrawal Processed', username, `Your withdrawal of <span class="amount">$${amount.toLocaleString()}</span> has been successfully processed and is now being transferred to your designated account. The funds should arrive within 1-3 business days.`, 'View Transaction History', 'withdrawal');
        break;

      case 'deposit':
        message = `Hello ${username},\n\nYour deposit of $${amount.toLocaleString()} has been successfully credited to your Vertex account on ${new Date().toLocaleString()}.\n\nYou can now start trading with your deposited funds.`;
        htmlContent = this.createModernTemplate('Deposit Successful', username, `Your deposit of <span class="amount">$${amount.toLocaleString()}</span> is now available in your Vertex Trading account. You can start trading immediately with your deposited funds.`, 'Start Trading Now', 'deposit');
        break;

      case 'transfer':
        message = `Hello ${username},\n\nYour transfer of $${amount.toLocaleString()} to ${receiver} has been successfully processed on ${new Date().toLocaleString()}.`;
        htmlContent = this.createModernTemplate('Transfer Completed', username, `Your transfer of <span class="amount">$${amount.toLocaleString()}</span> to ${receiver} has been successfully completed and processed.`, 'View Transfer Details', 'transfer');
        break;

      case 'conversion':
        const convertedAmount = conversionRate ? (amount * conversionRate).toFixed(6) : 'N/A';
        message = `Hello ${username},\n\nYour currency conversion has been successfully completed on ${new Date().toLocaleString()}.\n\nConverted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency} at rate ${conversionRate}.`;
        htmlContent = this.createModernTemplate('Currency Conversion Successful', username, `Your conversion of <span class="amount">${amount} ${fromCurrency}</span> to <span class="amount">${convertedAmount} ${toCurrency}</span> has been completed at rate ${conversionRate}.`, 'View Conversion History', 'conversion');
        break;
    }

    message += `\n\nThank you for using Vertex Trading.\n\nBest regards,\nVertex Trading Team`;

    const mailOptions = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to,
      subject,
      text: message,
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendWelcomeEmail(to: string, username: string) {
    const htmlContent = this.createModernTemplate('Welcome to Vertex Trading!', username, `Welcome to Vertex Trading! Your account has been successfully created. You can now start trading cryptocurrencies, manage your portfolio, and access our advanced trading features. Experience professional-grade trading tools and real-time market data.`, 'Start Trading Now', 'deposit');
    
    const mailOptions = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to,
      subject: 'Welcome to Vertex Trading!',
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const emailService = new EmailService();
