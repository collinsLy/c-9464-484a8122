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
      const { to, email, username, type, amount, receiver, fromCurrency, toCurrency, conversionRate } = req.body;
      
      // Support both 'to' and 'email' for the recipient field
      const recipientEmail = to || email;
      
      if (!recipientEmail || !username || !type || !amount) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username, type, amount" 
        });
      }

      const result = await emailService.sendTransactionEmail({
        to: recipientEmail,
        username,
        type,
        amount,
        receiver,
        fromCurrency,
        toCurrency,
        conversionRate
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
        amount: 1000
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
        amount: 100.50
      });
      res.json(result);
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
