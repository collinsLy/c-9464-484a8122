
import nodemailer from 'nodemailer';

// Create email service that can work in serverless environment
export const emailService = {
  async sendTransactionEmail({
    to,
    type,
    isReceiver,
    username,
    receiver,
    amount,
    crypto
  }: {
    to: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    isReceiver: boolean;
    username: string;
    receiver?: string;
    amount?: number;
    crypto?: string;
  }) {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    let subject = '';
    let message = '';

    if (type === 'transfer') {
      if (isReceiver) {
        subject = 'Vertex Trading - Funds Received';
        message = `Great news! You have received ${amount} ${crypto} from ${receiver}. The funds have been added to your Vertex Trading account and are available for immediate use.`;
      } else {
        subject = 'Vertex Trading - Transfer Sent Successfully';
        message = `Your transfer of ${amount} ${crypto} to ${receiver} has been successfully completed. The funds have been deducted from your account and transferred to the recipient.`;
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@vertextrading.com',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p>${message}</p>
          <p>Best regards,<br>Vertex Trading Team</p>
        </div>
      `
    };

    return await transporter.sendMail(mailOptions);
  }
};
