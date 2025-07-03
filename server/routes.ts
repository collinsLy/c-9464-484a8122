import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./email-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Email notification endpoints
  app.post("/api/send-transaction-email", async (req, res) => {
    try {
      const { email, username, type, amount, receiver } = req.body;
      
      if (!email || !username || !type || !amount) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username, type, amount" 
        });
      }

      const result = await emailService.sendTransactionEmail(
        email, 
        username, 
        type, 
        amount, 
        receiver
      );
      
      res.json(result);
    } catch (error) {
      console.error("Transaction email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  app.post("/api/send-welcome-email", async (req, res) => {
    try {
      const { email, username } = req.body;
      
      if (!email || !username) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username" 
        });
      }

      const result = await emailService.sendWelcomeEmail(email, username);
      res.json(result);
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const result = await emailService.sendTransactionEmail(
        "test@example.com",
        "Test User",
        "withdrawal",
        100.50
      );
      res.json(result);
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
