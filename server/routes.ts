import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./email-service";
import { auth } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Email notification endpoints
  app.post("/api/send-transaction-email", async (req, res) => {
    try {
      const { to, email, username, type, amount, currency, receiver, fromCurrency, toCurrency, conversionRate, isReceiver } = req.body;

      // Support both 'to' and 'email' for the recipient field
      const recipientEmail = to || email;

      if (!recipientEmail || !username || !type || !amount || !currency) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username, type, amount, currency" 
        });
      }

      const result = await emailService.sendTransactionEmail({
        to: recipientEmail,
        username,
        type,
        amount,
        currency,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate,
        isReceiver
      });

      res.json(result);
    } catch (error) {
      console.error("Transaction email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Test endpoint for email service
  app.get("/api/test-email", async (req, res) => {
    try {
      const result = await emailService.sendTransactionEmail({
        to: 'test@example.com',
        username: 'Test User',
        type: 'withdrawal',
        amount: 1000,
        currency: 'USDT'
      });
      res.json({ 
        message: 'Email test completed', 
        result: result 
      });
    } catch (error) {
      console.error("Email test error:", error);
      res.status(500).json({ success: false, error: "Email test failed" });
    }
  });

  app.post("/api/send-welcome-email", async (req, res) => {
    try {
      const { to, email, username } = req.body;

      // Support both 'to' and 'email' for the recipient field
      const recipientEmail = to || email;

      if (!recipientEmail || !username) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username" 
        });
      }

      const result = await emailService.sendWelcomeEmail({
        to: recipientEmail,
        username
      });
      res.json(result);
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const result = await emailService.sendTransactionEmail({
        to: "test@example.com",
        username: "Test User",
        type: "withdrawal",
        amount: 100.50,
        currency: "USDT"
      });
      res.json(result);
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Specific route for ticker/price endpoint with fallback
  app.get("/api/v3/ticker/price", async (req, res) => {
    try {
      const { symbols } = req.query;
      
      // Parse symbols if provided
      let symbolList: string[] = [];
      if (symbols) {
        try {
          symbolList = JSON.parse(symbols as string);
        } catch (e) {
          console.error('Failed to parse symbols:', symbols);
        }
      }

      // Fallback prices (realistic current market prices)
      const fallbackPrices = [
        { symbol: "BTCUSDT", price: "43250.50" },
        { symbol: "ETHUSDT", price: "2580.75" },
        { symbol: "BNBUSDT", price: "315.20" },
        { symbol: "ADAUSDT", price: "0.4850" },
        { symbol: "SOLUSDT", price: "98.45" },
        { symbol: "DOGEUSDT", price: "0.0890" },
        { symbol: "DOTUSDT", price: "7.25" },
        { symbol: "MATICUSDT", price: "0.85" }
      ];

      try {
        // Try Binance first
        let url = 'https://api.binance.com/api/v3/ticker/price';
        if (symbols) {
          url += `?symbols=${encodeURIComponent(symbols as string)}`;
        }

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Vertex-Trading-App/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.json(data);
          return;
        }
      } catch (binanceError) {
        console.log('Binance API unavailable, using fallback prices');
      }

      // Use fallback prices
      let responseData = fallbackPrices;
      if (symbolList.length > 0) {
        responseData = fallbackPrices.filter(item => symbolList.includes(item.symbol));
      }

      res.setHeader('Content-Type', 'application/json');
      res.json(responseData);
    } catch (error) {
      console.error("Ticker price proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch ticker prices",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Binance API proxy endpoints (general)
  app.get("/api/v3/:endpoint", async (req, res) => {
    try {
      const { endpoint } = req.params;
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://api.binance.com/api/v3/${endpoint}${queryString ? `?${queryString}` : ''}`;

      console.log(`Proxying request to: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Vertex-Trading-App/1.0'
        }
      });

      if (!response.ok) {
        console.error(`Binance API error: ${response.status} - ${response.statusText}`);
        return res.status(response.status).json({ 
          error: `Binance API error: ${response.status}`,
          details: response.statusText
        });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Invalid response format from Binance API:`, text);
        return res.status(502).json({ 
          error: "Invalid response format from Binance API",
          details: "Expected JSON but received HTML or other format"
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Binance proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch from Binance API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}