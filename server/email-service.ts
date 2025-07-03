
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

  private createGmailTemplate(title: string, username: string, message: string, buttonText: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vertex Trading - ${title}</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f5f5f5;
              }
              
              .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              
              .header {
                  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                  padding: 30px 40px;
                  text-align: center;
              }
              
              .logo-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
              }
              
              .logo {
                  width: 40px;
                  height: 40px;
              }
              
              .brand-name {
                  color: #f2ff44;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 1px;
              }
              
              .content {
                  padding: 40px;
              }
              
              .title {
                  font-size: 28px;
                  font-weight: 700;
                  color: #1a1a1a;
                  margin-bottom: 20px;
              }
              
              .message {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 30px;
                  line-height: 1.6;
              }
              
              .amount {
                  font-weight: 700;
                  color: #000;
              }
              
              .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #f2ff44 0%, #c8e854 100%);
                  color: #1a1a1a;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  font-size: 16px;
                  transition: all 0.3s ease;
                  box-shadow: 0 4px 15px rgba(242, 255, 68, 0.3);
              }
              
              .cta-button:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(242, 255, 68, 0.4);
              }
              
              .security-notice {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #f8f9fa;
                  border-radius: 6px;
                  border-left: 4px solid #f2ff44;
              }
              
              .security-text {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 10px;
              }
              
              .link {
                  color: #000;
                  text-decoration: none;
                  font-weight: 700;
              }
              
              .link:hover {
                  text-decoration: underline;
              }
              
              .footer-notice {
                  font-size: 12px;
                  color: #999;
                  font-style: italic;
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 1px solid #eee;
              }
              
              .footer {
                  background-color: #1a1a1a;
                  padding: 30px 40px;
                  text-align: center;
              }
              
              .footer-text {
                  color: #f2ff44;
                  font-size: 16px;
                  font-weight: 600;
                  margin-bottom: 20px;
              }
              
              @media (max-width: 600px) {
                  .email-container {
                      margin: 10px;
                      border-radius: 0;
                  }
                  
                  .header, .content, .footer {
                      padding: 20px;
                  }
                  
                  .title {
                      font-size: 24px;
                  }
                  
                  .brand-name {
                      font-size: 20px;
                  }
                  
                  .logo {
                      width: 32px;
                      height: 32px;
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
              
              <div class="content">
                  <h1 class="title">${title}</h1>
                  
                  <p class="message">
                      Hello ${username}, ${message} Read our <a href="#" class="link"><strong>FAQs</strong></a> if you are running into problems.
                  </p>
                  
                  <a href="#" class="cta-button">${buttonText}</a>
                  
                  <div class="security-notice">
                      <p class="security-text">
                          Don't recognize this activity? Please <a href="#" class="link">reset your password</a> and contact <a href="#" class="link">customer support</a> immediately.
                      </p>
                  </div>
                  
                  <p class="footer-notice">
                      This is an automated message, please do not reply.
                  </p>
              </div>
              
              <div class="footer">
                  <p class="footer-text">Thank you for choosing Vertex Trading!</p>
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
        htmlContent = this.createGmailTemplate('Withdrawal Processed', username, `Your withdrawal of <span class="amount">$${amount.toLocaleString()}</span> has been successfully processed and is now being transferred to your designated account.`, 'View Transaction History');
        break;

      case 'deposit':
        message = `Hello ${username},\n\nYour deposit of $${amount.toLocaleString()} has been successfully credited to your Vertex account on ${new Date().toLocaleString()}.\n\nYou can now start trading with your deposited funds.`;
        htmlContent = this.createGmailTemplate('Deposit Successful', username, `Your deposit of <span class="amount">$${amount.toLocaleString()}</span> is now available in your Vertex Trading account. Log in to check your balance.`, 'Visit Your Dashboard');
        break;

      case 'transfer':
        message = `Hello ${username},\n\nYour transfer of $${amount.toLocaleString()} to ${receiver} has been successfully processed on ${new Date().toLocaleString()}.`;
        htmlContent = this.createGmailTemplate('Transfer Completed', username, `Your transfer of <span class="amount">$${amount.toLocaleString()}</span> to ${receiver} has been successfully completed.`, 'View Transfer Details');
        break;

      case 'conversion':
        const convertedAmount = conversionRate ? (amount * conversionRate).toFixed(6) : 'N/A';
        message = `Hello ${username},\n\nYour currency conversion has been successfully completed on ${new Date().toLocaleString()}.\n\nConverted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency} at rate ${conversionRate}.`;
        htmlContent = this.createGmailTemplate('Currency Conversion Successful', username, `Your conversion of <span class="amount">${amount} ${fromCurrency}</span> to <span class="amount">${convertedAmount} ${toCurrency}</span> has been completed at rate ${conversionRate}.`, 'View Conversion History');
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
    const htmlContent = this.createGmailTemplate('Welcome to Vertex Trading!', username, `Welcome to Vertex Trading! Your account has been successfully created. You can now start trading cryptocurrencies, manage your portfolio, and access our advanced trading features.`, 'Start Trading Now');
    
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
