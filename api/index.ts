
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { emailService } from '../server/email-service';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Email endpoint
app.post('/api/send-transaction-email', async (req, res) => {
  try {
    const { to, type, isReceiver, username, receiver, amount, currency } = req.body;
    
    const result = await emailService.sendTransactionEmail({
      to,
      type,
      isReceiver,
      username,
      receiver,
      amount,
      currency
    });
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email sending error:', error);
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
