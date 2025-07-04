
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email endpoint
app.post('/api/send-transaction-email', async (req, res) => {
  try {
    console.log('📧 Email endpoint called with:', req.body);
    
    const { to, email, type, isReceiver, username, receiver, amount, currency } = req.body;
    
    // Support both 'to' and 'email' parameters
    const recipientEmail = to || email;
    
    // Check environment variables
    const emailUser = process.env.EMAIL_USER || 'kelvinkelly3189@gmail.com';
    const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD || 'zozj kjez thsb adhs';
    
    console.log('📧 Email config:', { 
      emailUser, 
      hasPassword: !!emailPass,
      envVars: Object.keys(process.env).filter(key => key.includes('EMAIL'))
    });
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    // Validate required fields
    if (!recipientEmail || !username || !type || !amount || !currency) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: email, username, type, amount, currency" 
      });
    }
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Create email content
    let subject = '';
    let message = '';
    
    if (type === 'transfer') {
      if (isReceiver) {
        subject = 'Vertex Trading - Funds Received';
        message = `Great news! You have received ${amount} ${currency} from ${receiver}. The funds have been added to your Vertex Trading account.`;
      } else {
        subject = 'Vertex Trading - Transfer Sent Successfully';
        message = `Your transfer of ${amount} ${currency} to ${receiver} has been successfully completed.`;
      }
    } else if (type === 'withdrawal') {
      subject = 'Vertex Trading - Withdrawal Confirmation';
      message = `Your withdrawal of ${amount} ${currency} has been successfully processed.`;
    } else if (type === 'deposit') {
      subject = 'Vertex Trading - Deposit Confirmation';
      message = `Your deposit of ${amount} ${currency} is now available in your account.`;
    }
    
    const mailOptions = {
      from: `"Vertex Trading" <${emailUser}>`,
      to: recipientEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff7a00;">${subject}</h2>
          <p>Dear ${username},</p>
          <p>${message}</p>
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #ff7a00;">Transaction Details</h3>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Status:</strong> Completed</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Thank you for using Vertex Trading!</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}:`, result.messageId);
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('❌ Email sending error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Price proxy endpoint
app.get('/api/v3/ticker/price', async (req, res) => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Export for Vercel
export default app;
