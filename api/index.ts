
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
    
    const currentYear = new Date().getFullYear();
    const transactionId = `VTX-${Date.now()}`;
    const timestamp = new Date().toLocaleString();
    
    const mailOptions = {
      from: `"Vertex Trading" <${emailUser}>`,
      to: recipientEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="background-color: #f5f5f5; color: #333333; font-family: Arial, sans-serif; margin: 0; padding: 40px 20px; min-height: 100vh;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="padding: 30px; border-bottom: 1px solid #e0e0e0; text-align: center;">
              <img src="https://cryptologos.cc/logos/v-systems-vsys-logo.png?v=040" alt="V-Systems Logo" style="height: 50px; width: auto; margin-bottom: 15px;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">Vertex Trading</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${subject}</h2>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">Dear ${username},</p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #555555; line-height: 1.6;">${message}</p>
              
              <!-- Status Badge -->
              <div style="display: inline-block; padding: 8px 16px; background-color: #4caf50; color: #ffffff; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 30px;">
                ${type === 'transfer' && isReceiver ? 'FUNDS RECEIVED' : 'COMPLETED'}
              </div>
              
              <!-- Transaction Details -->
              <div style="background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #ff7a00; font-weight: bold;">Transaction Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Transaction ID:</td>
                    <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0;">${transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Type:</td>
                    <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; text-transform: capitalize;">${type === 'transfer' ? (isReceiver ? 'Transfer Received' : 'Transfer Sent') : type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Amount:</td>
                    <td style="padding: 10px 0; font-size: 14px; color: #ff7a00; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; font-weight: bold;">${amount.toLocaleString()} ${currency}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-size: 14px; color: #666666; border-bottom: 1px solid #e0e0e0;">Status:</td>
                    <td style="padding: 10px 0; font-size: 14px; color: #4caf50; text-align: right; font-family: monospace; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Completed</td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0 5px 0; font-size: 16px; color: #1a1a1a; font-weight: bold;">Timestamp:</td>
                    <td style="padding: 15px 0 5px 0; font-size: 16px; color: #1a1a1a; text-align: right; font-family: monospace; font-weight: bold;">${timestamp}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 30px 0 0 0; font-size: 16px; color: #555555; line-height: 1.6;">
                Thank you for choosing Vertex Trading. Your transaction has been processed successfully.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://vertex-trading.replit.app" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #ff7a00 0%, #ff9a40 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 122, 0, 0.3);">
                  ${type === 'transfer' && isReceiver ? 'View Your Balance' : type === 'deposit' ? 'Start Trading Now' : 'View Transaction History'}
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 30px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666; line-height: 1.5;">
                This email was sent by Vertex Trading. For support, please contact us at 
                <a href="mailto:support@vertextrading.com" style="color: #ff7a00; text-decoration: none;">support@vertextrading.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© ${currentYear} Vertex Trading. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
