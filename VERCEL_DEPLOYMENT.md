# Vercel Deployment Guide for Vertex Trading Platform

## Prerequisites

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com and sign up/login

## Deployment Steps

### 1. Login to Vercel CLI
```bash
vercel login
```

### 2. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required environment variables:
- `EMAIL_SERVICE` - Email service provider (e.g., "gmail")
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - App-specific password for email
- `SESSION_SECRET` - A secure random string

Optional variables:
- Firebase Admin SDK credentials (if using Firebase features)
- API keys for external services

### 3. Deploy to Vercel

#### Option A: Deploy to Production
```bash
vercel --prod
```

#### Option B: Deploy Preview
```bash
vercel
```

### 4. Configure Environment Variables on Vercel

After deployment, set your environment variables in Vercel dashboard:

1. Go to your project on https://vercel.com
2. Navigate to Settings → Environment Variables
3. Add each variable from your `.env.local` file

Or use CLI:
```bash
# Example for each variable
vercel env add EMAIL_SERVICE production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add SESSION_SECRET production
```

## Post-Deployment

### Custom Domain (Optional)
```bash
vercel domains add your-domain.com
```

### View Logs
```bash
vercel logs
```

### Redeploy
```bash
vercel --prod
```

## Project Structure

- `/api` - Serverless functions
- `/client` - React frontend (built to `/dist/public`)
- `/server` - Shared server code

## Important Notes

1. **API Routes**: All API endpoints are accessible at `/api/*`
2. **Build Output**: Frontend is built to `/dist/public`
3. **Serverless Functions**: Located in `/api` directory
4. **Max Duration**: API functions have 30-second timeout

## Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check build logs: `vercel logs`

### API Not Working
- Ensure environment variables are set in Vercel dashboard
- Check function logs: `vercel logs --source=lambda`

### Email Service Issues
- Verify email credentials are correct
- Use app-specific passwords for Gmail
- Check Vercel function logs for errors

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Check deployment logs in Vercel dashboard
- Review function logs for API errors