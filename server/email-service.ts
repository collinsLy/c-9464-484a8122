
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
    type: 'withdrawal' | 'deposit' | 'transfer',
    amount: number,
    receiver?: string
  ) {
    const subject = `Vertex ${type.charAt(0).toUpperCase() + type.slice(1)} Confirmation`;
    
    let message = `Hello ${username},\n\nYour ${type} of $${amount.toLocaleString()} was successfully processed on ${new Date().toLocaleString()}.`;
    
    if (type === 'transfer' && receiver) {
      message += `\nTransferred to: ${receiver}`;
    }
    
    message += `\n\nThank you for using Vertex Trading.\n\nBest regards,\nVertex Trading Team`;

    const mailOptions = {
      from: '"Vertex Trading" <kelvinkelly3189@gmail.com>',
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Transaction Confirmation</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your <strong>${type}</strong> of <strong>$${amount.toLocaleString()}</strong> was successfully processed on <strong>${new Date().toLocaleString()}</strong>.</p>
          ${type === 'transfer' && receiver ? `<p><strong>Transferred to:</strong> ${receiver}</p>` : ''}
          <p>Thank you for using Vertex Trading.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Best regards,<br>Vertex Trading Team</p>
        </div>
      `
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
