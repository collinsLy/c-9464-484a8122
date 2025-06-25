import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple API handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Basic health check endpoint
  if (req.url === '/api/health') {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  // Placeholder for your API routes
  res.status(404).json({ message: 'API endpoint not found' });
}