# Vertex Trading Platform

## Project Overview
A comprehensive cryptocurrency trading platform migrated from Lovable to Replit environment. The platform includes trading features for spot, futures, P2P, automated trading bots, market analysis, and user management.

## Recent Changes
- **2025-01-03**: Successfully migrated from Replit Agent to Replit environment
- **2025-01-03**: Fixed nodemailer API usage in email service (createTransport vs createTransporter)
- **2025-01-03**: Resolved TypeScript error handling for email service exceptions
- **2025-01-03**: Fixed Firebase index error by removing composite orderBy query
- **2025-01-03**: Enhanced email debugging with detailed logging and user feedback
- **2025-01-03**: Implemented Firebase Auth email for transactions (withdrawal & transfer confirmations)
- **2025-01-03**: Fixed syntax error in WithdrawPage.tsx (corrupted code block)
- **2025-01-03**: Verified application runs cleanly with proper client/server separation
- **2024-12-25**: Successfully migrated from Lovable to Replit
- **2024-12-25**: Updated background color to #0f1115 across entire application
- **2024-12-25**: Installed all required dependencies (React Router, Firebase, Supabase, Radix UI, etc.)
- **2024-12-25**: Fixed CSS variables and theme system for dark mode consistency
- **2024-12-25**: Enhanced payment gateway iframe with modern design
- **2024-12-25**: Renamed to "Vertex Deposit Checkpoint" with advanced loading animation
- **2024-12-25**: Added Vertex logo to header with gradient effects and SSL security indicator
- **2024-12-25**: Updated payment gateway iframe to "Vertex Deposit Checkpoint" with Vertex logo loading animation
- **2024-12-25**: Configured Vercel deployment with serverless functions and static build setup
- **2024-12-25**: Fixed Vercel function runtime version specification error
- **2024-12-25**: Updated payment gateway iframe to "Vertex Deposit Checkpoint" with Vertex logo loading animation

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite build system
- **UI Framework**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth
- **Database**: Supabase integration
- **Backend**: Express.js server with TypeScript

## User Preferences
- Background color preference: #0f1115 (dark theme)
- Design system: shadcn/ui components preferred
- Responsive design focus for mobile and desktop

## Key Features
- Spot and futures trading
- P2P marketplace
- Automated trading bots
- Market analysis and charts
- User account management
- Real-time notifications
- Mobile-responsive design