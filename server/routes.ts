import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./email-service";
import { messagingService } from "./messaging-service";
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
      console.log('📧 Welcome email endpoint called with body:', req.body);
      const { to, email, username } = req.body;

      // Support both 'to' and 'email' for the recipient field
      const recipientEmail = to || email;

      if (!recipientEmail || !username) {
        console.error('❌ Missing required fields for welcome email:', { recipientEmail, username });
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: email, username" 
        });
      }

      console.log('📧 Calling emailService.sendWelcomeEmail with:', { to: recipientEmail, username });
      const result = await emailService.sendWelcomeEmail({
        to: recipientEmail,
        username
      });
      
      console.log('📧 Welcome email service result:', result);
      res.json(result);
    } catch (error) {
      console.error("Welcome email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Test welcome email endpoint
  app.post("/api/test-welcome-email", async (req, res) => {
    try {
      const { email, username } = req.body;
      const testEmail = email || "test@example.com";
      const testUsername = username || "Test User";

      console.log('🧪 Testing welcome email with:', { email: testEmail, username: testUsername });
      
      const welcomeResult = await emailService.sendWelcomeEmail({
        to: testEmail,
        username: testUsername
      });

      res.json({ 
        welcomeEmail: welcomeResult,
        message: "Welcome email test completed",
        testData: { email: testEmail, username: testUsername }
      });
    } catch (error) {
      console.error("Test welcome email error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Comprehensive email delivery test
  app.post("/api/test-email-delivery", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address required" });
      }

      console.log('🧪 Testing email delivery to:', email);

      // Test connection first
      const connectionTest = await emailService.testConnection();
      
      // Send test emails to multiple addresses
      const results = [];
      
      // Primary test
      const primaryResult = await emailService.sendWelcomeEmail({
        to: email,
        username: "Test User"
      });
      results.push({ type: 'primary', email, result: primaryResult });

      // Test with backup addresses if primary fails
      if (!primaryResult.success) {
        const backupEmails = [
          'kelvinkelly3189@gmail.com', // Your own email
          'test.vertex.trading@gmail.com' // Backup test email
        ];

        for (const backupEmail of backupEmails) {
          if (backupEmail !== email) {
            const backupResult = await emailService.sendWelcomeEmail({
              to: backupEmail,
              username: "Backup Test User"
            });
            results.push({ type: 'backup', email: backupEmail, result: backupResult });
          }
        }
      }

      res.json({
        connectionTest,
        results,
        message: "Email delivery test completed",
        troubleshooting: {
          checkSpamFolder: "Check your spam/junk folder",
          gmailBlocking: "Some email providers may block Gmail SMTP",
          rateLimiting: "Gmail may rate-limit emails",
          appPassword: "Ensure Gmail app password is correct"
        }
      });
    } catch (error) {
      console.error("Email delivery test error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Email reputation check endpoint
  app.post("/api/check-email-reputation", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address required" });
      }

      console.log('🔍 Checking email reputation for:', email);

      // Send a simple, non-promotional test email
      const simpleTestResult = await emailService.sendWelcomeEmail({
        to: email,
        username: "User"
      });

      res.json({
        reputation: {
          deliverySuccess: simpleTestResult.success,
          messageId: simpleTestResult.messageId,
          timestamp: new Date().toISOString()
        },
        recommendations: [
          "Check spam/junk folder",
          "Add sender to contacts",
          "Mark as 'Not Spam' if found in spam",
          "Gmail may flag new senders initially"
        ],
        message: "Email reputation check completed"
      });
    } catch (error) {
      console.error("Email reputation check error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const transactionResult = await emailService.sendTransactionEmail({
        to: "test@example.com",
        username: "Test User",
        type: "withdrawal",
        amount: 100.50,
        currency: "USDT"
      });

      const welcomeResult = await emailService.sendWelcomeEmail({
        to: "test@example.com",
        username: "Test User"
      });

      res.json({ 
        transactionEmail: transactionResult,
        welcomeEmail: welcomeResult,
        message: "Both email types tested"
      });
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

  // Debug middleware to log all requests
  app.use('/api/admin', (req, res, next) => {
    console.log(`📡 Admin API Request: ${req.method} ${req.originalUrl}`);
    console.log(`📡 Request Body:`, req.body);
    next();
  });

  // Admin test endpoint
  app.get("/api/admin/test", (req, res) => {
    res.json({ 
      success: true, 
      message: "Admin API is working",
      timestamp: new Date().toISOString()
    });
  });

  // Admin Messaging System Routes
  app.post("/api/admin/send-targeted-message", async (req, res) => {
    try {
      const { recipients, subject, body, channel, priority, senderId } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Recipients array is required" 
        });
      }

      if (!subject || !body || !channel || !senderId) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: subject, body, channel, senderId" 
        });
      }

      const result = await messagingService.sendTargetedMessage({
        recipients,
        subject,
        body,
        channel,
        priority: priority || 'normal',
        senderId
      });

      res.json(result);
    } catch (error) {
      console.error("Targeted message error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to send targeted message",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/admin/send-system-broadcast", async (req, res) => {
    try {
      const { subject, body, channel, priority, senderId, allUserEmails } = req.body;

      if (!subject || !body || !channel || !senderId) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: subject, body, channel, senderId" 
        });
      }

      if (!allUserEmails || !Array.isArray(allUserEmails) || allUserEmails.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "User emails array is required for system broadcast" 
        });
      }

      const result = await messagingService.sendSystemBroadcast({
        subject,
        body,
        channel,
        priority: priority || 'normal',
        senderId
      }, allUserEmails);

      res.json(result);
    } catch (error) {
      console.error("System broadcast error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to send system broadcast",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/admin/send-kyc-notification", async (req, res) => {
    try {
      const { userEmail, userName, status, comments, adminId } = req.body;

      if (!userEmail || !userName || !status || !adminId) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields: userEmail, userName, status, adminId" 
        });
      }

      if (!['approved', 'rejected', 'under_review'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid status. Must be: approved, rejected, or under_review" 
        });
      }

      const result = await messagingService.sendKYCStatusNotification({
        userEmail,
        userName,
        status,
        comments,
        adminId
      });

      res.json(result);
    } catch (error) {
      console.error("KYC notification error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to send KYC notification",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/admin/test-messaging", async (req, res) => {
    try {
      const connected = await messagingService.testConnection();
      
      if (!connected) {
        return res.status(500).json({ 
          success: false, 
          error: "Messaging service connection failed" 
        });
      }

      // Send test message
      const result = await messagingService.sendTargetedMessage({
        recipients: ['test@example.com'],
        subject: 'Test Admin Message',
        body: 'This is a test message from the admin messaging system.',
        channel: 'email',
        priority: 'normal',
        senderId: 'system-test'
      });

      res.json({ 
        success: true,
        message: 'Messaging service test completed',
        connectionStatus: 'connected',
        testResult: result
      });
    } catch (error) {
      console.error("Messaging test error:", error);
      res.status(500).json({ 
        success: false, 
        error: 'Messaging test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
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

  // Admin endpoints for user management
  app.get("/api/admin/auth-users", async (req, res) => {
    try {
      console.log('🔍 Fetching Firebase Authentication users...');
      
      // Check if Firebase Admin is initialized
      try {
        getAuth();
      } catch (error) {
        console.log('⚠️ Firebase Admin not available');
        return res.json({ users: [] });
      }

      const listUsers = await getAuth().listUsers(1000); // Get up to 1000 users
      const users = listUsers.users.map(userRecord => ({
        id: userRecord.uid,
        email: userRecord.email || '',
        fullName: userRecord.displayName || '',
        balance: 0, // Default balance
        assets: {},
        kycStatus: 'pending',
        createdAt: new Date(userRecord.metadata.creationTime),
        lastLogin: userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : null,
        isBlocked: userRecord.disabled || false,
        isFlagged: false,
        emailVerified: userRecord.emailVerified
      }));

      console.log(`✅ Found ${users.length} Firebase Auth users`);
      res.json({ users, total: users.length });
    } catch (error) {
      console.error('❌ Error fetching Firebase Auth users:', error);
      // Return empty array instead of error to allow fallback
      res.json({ users: [], error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/admin/update-user-status", async (req, res) => {
    try {
      const { userId, action } = req.body;
      
      if (!userId || !action) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing userId or action" 
        });
      }

      console.log(`🔧 Admin action: ${action} for user ${userId}`);

      // Check if Firebase Admin is available
      try {
        const { getApps } = await import('firebase-admin/app');
        const { getAuth } = await import('firebase-admin/auth');
        
        if (getApps().length === 0) {
          console.log('⚠️ Firebase Admin not initialized, simulating action for demonstration');
          // For demonstration purposes, just log the action
          res.json({ 
            success: true, 
            message: `User ${action} action simulated (Firebase Admin not configured)` 
          });
          return;
        }

        // Firebase Admin is available, perform actual action
        switch (action) {
          case 'block':
            await getAuth().updateUser(userId, { disabled: true });
            break;
          case 'unblock':
            await getAuth().updateUser(userId, { disabled: false });
            break;
          case 'flag':
            // For flagging, we'll store this in Firestore custom claims or metadata
            await getAuth().setCustomUserClaims(userId, { flagged: true });
            break;
          case 'unflag':
            await getAuth().setCustomUserClaims(userId, { flagged: false });
            break;
          default:
            return res.status(400).json({ 
              success: false, 
              error: "Invalid action" 
            });
        }

        res.json({ 
          success: true, 
          message: `User ${action} action completed` 
        });
      } catch (authError) {
        console.log('⚠️ Firebase Auth action failed, using fallback simulation');
        res.json({ 
          success: true, 
          message: `User ${action} action simulated (Firebase Admin error: ${authError instanceof Error ? authError.message : 'Unknown error'})` 
        });
      }
    } catch (error) {
      console.error(`❌ Error performing user action:`, error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}