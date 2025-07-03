# Vertex Trading Platform

## Project Overview
A comprehensive cryptocurrency trading platform migrated from Lovable to Replit environment. The platform includes trading features for spot, futures, P2P, automated trading bots, market analysis, and user management.

## Recent Changes
- **2025-01-03**: Successfully completed migration from Replit Agent to Replit environment
- **2025-01-03**: Fixed UID transfer logic for receiving funds - converted numerical UID to Firebase UID properly
- **2025-01-03**: Added automatic numerical UID creation for users when not present
- **2025-01-03**: Enhanced debugging for UID validation with proper error handling
- **2025-01-03**: Updated NumericalUidService imports to use static methods correctly
- **2025-01-03**: Verified Express server and Vite client running properly with API endpoint connectivity
- **2025-01-03**: Implemented comprehensive preload data system for performance optimization
- **2025-01-03**: Added PreloadProvider context for global state management of user data and prices
- **2025-01-03**: Created preload service with 30-second price caching and automatic refresh
- **2025-01-03**: Added custom hooks (usePreloadData, usePreloadedBalance, usePreloadedPrices) for easy data access
- **2025-01-03**: Built PreloadDemo component showing real-time balance, profile, and cached prices
- **2025-01-03**: Integrated preload system into main App component for automatic login triggers
- **2025-01-03**: Successfully migrated project from Replit Agent to Replit environment with enhanced performance
- **2025-01-03**: Changed email template background from dark theme to white background for better readability
- **2025-01-03**: Updated logo to use user's custom V-Systems logo (orange V design) instead of default logo
- **2025-01-03**: Applied new white theme color scheme (#ffffff background, #ff7a00 orange accents)
- **2025-01-03**: Fixed transfer email notifications to send to both sender and receiver
- **2025-01-03**: Updated both UidTransfer component and WithdrawPage to send emails to both parties in transfers
- **2025-01-03**: Successfully implemented modern email template design based on vertex-email-glow reference repository
- **2025-01-03**: Updated email templates with clean card-based layout using HSL color scheme (dark theme)
- **2025-01-03**: Implemented professional header with V-Systems logo and brand name
- **2025-01-03**: Added structured transaction details table with proper typography and spacing
- **2025-01-03**: Created bright yellow CTA buttons and clean footer design matching reference design
- **2025-01-03**: Completely rewrote email service with modern TypeScript API using Zod validation
- **2025-01-03**: Updated server routes to support new email service API structure
- **2025-01-03**: Verified all email types working correctly (deposit, withdrawal, transfer, conversion, welcome)
- **2025-01-03**: Successfully redesigned all email templates to match Gmail template design
- **2025-01-03**: Implemented V-Systems logo (https://cryptologos.cc/logos/v-systems-vsys-logo.svg?v=040) in all email headers
- **2025-01-03**: Applied exact color scheme from provided Gmail template (#1a1a1a, #2a2a2a, #f2ff44, #c8e854)
- **2025-01-03**: Created unified Gmail template method for all transaction types (deposit, withdrawal, transfer, conversion, welcome)
- **2025-01-03**: Added professional gradient buttons and security notice sections matching original design
- **2025-01-03**: Verified all updated email templates with successful test deliveries
- **2025-01-03**: Successfully completed migration from Replit Agent to Replit environment
- **2025-01-03**: Implemented comprehensive email notification system for all transaction types
- **2025-01-03**: Added support for withdrawal, deposit, transfer, and currency conversion emails
- **2025-01-03**: Created beautiful HTML email templates with transaction-specific designs
- **2025-01-03**: Added email testing interface in Settings → Notifications tab
- **2025-01-03**: Configured Gmail SMTP with proper credentials (kelvinkelly3189@gmail.com)
- **2025-01-03**: Fixed email notification system with proper environment variable configuration
- **2025-01-03**: Verified email service working correctly with successful test email delivery
- **2025-01-03**: Fixed preview refresh loops by disabling WebSocket connections and TradingView scripts
- **2025-01-03**: Optimized application loading performance with lazy loading for all routes
- **2025-01-03**: Fixed React Query configuration TypeScript errors for better error handling
- **2025-01-03**: Implemented Suspense wrapper for improved loading states
- **2025-01-03**: Fixed Firebase Admin SDK security issue with conditional initialization
- **2025-01-03**: Installed missing cross-env dependency for proper environment variable handling
- **2025-01-03**: Verified application runs cleanly with proper client/server separation
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
- **Performance Optimization**: Preload data system with automatic login triggers
- **Caching System**: 30-second price caching with intelligent refresh
- **Context Management**: Global state management for user data and market prices