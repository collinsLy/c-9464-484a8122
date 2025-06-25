# Vercel Deployment Instructions

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

## Deployment Steps

### Option 1: Deploy via Vercel CLI
1. Run `vercel` in your project root
2. Follow the prompts to link your project
3. Choose settings:
   - Framework: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/public`
   - Development Command: `npm run dev`

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Configure build settings:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/public`

## Environment Variables
Set these in your Vercel dashboard:
- `NODE_ENV=production`
- Add your Firebase, Supabase, and other API keys

## Notes
- Your frontend will be served as static files
- API routes are handled by serverless functions in `/api`
- The build process creates optimized production assets
- Database connections should use environment variables

## Troubleshooting
- If build fails, check that all dependencies are in package.json
- Ensure environment variables are properly set
- Check Vercel function logs for runtime errors