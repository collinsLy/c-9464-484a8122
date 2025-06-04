import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const BINANCE_API_KEY = 'NiWE5jWE2QH5j627FT8BWbzYOuM1MaEQdAYoXqrWcn3NgpS4rTal6e9OTuCFBOoL';

  // Binance API proxy to handle CORS
  app.get('/api/binance/prices', async (req, res) => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price', {
        headers: {
          'X-MBX-APIKEY': BINANCE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching Binance prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  // Specific symbol price endpoint
  app.get('/api/binance/price/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
        headers: {
          'X-MBX-APIKEY': BINANCE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      res.status(500).json({ error: 'Failed to fetch price' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
