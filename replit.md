# Vertex Trading Platform

## Overview
The Vertex Trading Platform is a comprehensive cryptocurrency trading platform offering spot, futures, P2P, automated trading bots, market analysis, and user management functionalities. Its primary purpose is to provide a robust and feature-rich environment for cryptocurrency trading, migrated and optimized for the Replit environment. The platform aims to capture market share by offering advanced trading features, a secure KYC verification system, and an intuitive user experience.

## User Preferences
- Background color preference: #0f1115 (dark theme)
- Design system: shadcn/ui components preferred
- Responsive design focus for mobile and desktop

## System Architecture
The platform is built with a modern web stack, ensuring high performance, scalability, and maintainability.

**Frontend:**
- **Framework:** React 18 with TypeScript
- **Build System:** Vite
- **UI/UX:** Utilizes `shadcn/ui` components based on Radix UI for a consistent and modern design. Styling is managed with Tailwind CSS, complemented by custom CSS variables for flexible theming, specifically a dark theme (`#0f1115` background) with orange accents for branding.
- **State Management:** React Query is employed for efficient server state management.
- **Routing:** React Router DOM handles client-side navigation.
- **Performance:** Features a comprehensive preload data system with a 30-second price caching mechanism and automatic refresh to optimize loading times. Lazy loading is implemented for all routes to enhance initial load performance.
- **Notifications:** Integrated Web Audio API for specific transaction sounds (e.g., Apple Pay-style "ding" for financial transactions) while keeping other notifications silent.
- **Branding:** Consistent application of a custom "V" logo (orange V design) across the platform, including navbar, sidebar, and favicon.

**Backend:**
- **Server:** Express.js developed in TypeScript.
- **Email Service:** A robust email notification system is implemented using Nodemailer, featuring modern, redesigned HTML templates (initially dark theme, later updated to white background with orange accents) for all transaction types (deposit, withdrawal, transfer, conversion, welcome). It includes Zod validation for API structures and sends distinct emails to sender/receiver for transfers.

**Core Features & Design Patterns:**
- **Trading Capabilities:** Supports spot and futures trading, P2P transactions, and automated trading bots with custom trading amount inputs and balance validation.
- **User & Admin Management:** Includes comprehensive user account management, an external admin panel (`/admin-kyc`) with a 6-tab interface (Overview, Users, Messaging, KYC Review, Security, Legacy Tools) for streamlined operations. The admin panel features user search, filtering, bulk actions, and account controls (block/unblock/flag).
- **KYC Verification:** A 3-step KYC verification system integrated into the user settings, involving personal info, document submission, and review.
- **Security:** Enhanced admin authentication with access control, duplicate account detection, and fraud prevention. KYC documents are stored in a secure, private Supabase bucket with access controlled via signed URLs.
- **System Notices:** Implementation of a `SystemNotice` component for dashboard-wide notifications with dismiss functionality.

## External Dependencies
- **Authentication:** Firebase Authentication for user authentication.
- **Database:** Supabase for database operations, including secure storage of KYC documents.
- **Email Service:** Gmail SMTP for sending transaction and system emails.
- **Market Data:** TradingView chart component for real-time market analysis (e.g., BTCUSD chart from Binance).
- **Deployment:** Vercel for serverless deployment of the application.