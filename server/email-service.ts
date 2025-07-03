
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
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">💸 Withdrawal Confirmation</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #27ae60; margin: 0 0 10px 0;">✅ Withdrawal Successful</h3>
                <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Processed</p>
              </div>
              <p>The funds should arrive in your account within 1-3 business days.</p>
            </div>
          </div>`;
        break;

      case 'deposit':
        message = `Hello ${username},\n\nYour deposit of $${amount.toLocaleString()} has been successfully credited to your Vertex account on ${new Date().toLocaleString()}.\n\nYou can now start trading with your deposited funds.`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">💰 Deposit Confirmation</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin: 0 0 10px 0;">✅ Deposit Successful</h3>
                <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Credited</p>
              </div>
              <p>Your funds are now available for trading. Start exploring our markets!</p>
            </div>
          </div>`;
        break;

      case 'transfer':
        message = `Hello ${username},\n\nYour transfer of $${amount.toLocaleString()} to ${receiver} has been successfully processed on ${new Date().toLocaleString()}.`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">🔄 Transfer Confirmation</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <div style="background: #fff3e0; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #f57c00; margin: 0 0 10px 0;">✅ Transfer Successful</h3>
                <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Recipient:</strong> ${receiver}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Completed</p>
              </div>
              <p>The recipient will receive a notification about this transfer.</p>
            </div>
          </div>`;
        break;

      case 'conversion':
        const convertedAmount = conversionRate ? (amount * conversionRate).toFixed(6) : 'N/A';
        message = `Hello ${username},\n\nYour currency conversion has been successfully completed on ${new Date().toLocaleString()}.\n\nConverted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency} at rate ${conversionRate}.`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">🔄 Currency Conversion Confirmation</h2>
              <p>Hello <strong>${username}</strong>,</p>
              <div style="background: #f3e5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #7b1fa2; margin: 0 0 10px 0;">✅ Conversion Successful</h3>
                <p style="margin: 5px 0;"><strong>From:</strong> ${amount} ${fromCurrency}</p>
                <p style="margin: 5px 0;"><strong>To:</strong> ${convertedAmount} ${toCurrency}</p>
                <p style="margin: 5px 0;"><strong>Rate:</strong> ${conversionRate}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>Your converted funds are now available in your account.</p>
            </div>
          </div>`;
        break;
    }

    message += `\n\nThank you for using Vertex Trading.\n\nBest regards,\nVertex Trading Team`;

    const mailOptions = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to,
      subject,
      text: message,
      html: htmlContent + `
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f3f6; border-radius: 6px;">
          <p style="color: #666; font-size: 14px; margin: 0;">Thank you for using Vertex Trading</p>
          <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">Best regards, Vertex Trading Team</p>
        </div>
      </div>`
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
    const mailOptions = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to,
      subject: 'Welcome to Vertex Trading!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Vertex Trading!</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Welcome to Vertex Trading! Your account has been successfully created.</p>
          <p>You can now start trading cryptocurrencies, manage your portfolio, and access our advanced trading features.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Best regards,<br>Vertex Trading Team</p>
        </div>
      `
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
