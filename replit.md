# Vertex Trading Platform

## Overview

This is a comprehensive cryptocurrency trading platform built with a modern full-stack architecture. The application provides demo and live trading capabilities, automated trading bots, portfolio management, and various crypto-related services including P2P trading, staking, and social trading features.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React-based SPA with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Firebase Authentication integration
- **State Management**: React Query for server state, React Context for client state
- **UI Framework**: Shadcn/ui components with Tailwind CSS styling
- **Real-time Data**: Integration with Binance API, CoinGecko API, and TradingView widgets

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system using CSS variables
- **Shadcn/ui** component library for consistent UI patterns
- **React Query** for efficient data fetching and caching
- **React Router** for client-side routing
- **Progressive Web App** features with service worker registration

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations with PostgreSQL
- **Session-based** middleware for request logging
- **Modular routing** system with centralized route registration
- **Storage abstraction** layer supporting both in-memory and database persistence

### Database Schema
- **Users table**: Basic user authentication and profile information
- **PostgreSQL**: Primary database with Drizzle migrations
- **Connection**: Neon Database serverless PostgreSQL instance

### UI/UX Design Decisions
- **Dark theme** optimized design with glassmorphism effects
- **Mobile-first** responsive design with touch optimization
- **Accessibility** considerations with proper ARIA labels and keyboard navigation
- **Performance** optimizations including code splitting and lazy loading

## Data Flow

1. **Authentication Flow**: Firebase handles user authentication with custom user profiles stored in PostgreSQL
2. **Trading Data**: Real-time market data fetched from external APIs (Binance, CoinGecko)
3. **Demo Mode**: Local storage for demo trading with simulated balances
4. **Real Trading**: Firebase integration for user data persistence
5. **API Integration**: Multiple external APIs for market data, news, and trading functionality

## External Dependencies

### Core APIs
- **Binance API**: Real-time cryptocurrency prices and market data
- **CoinGecko API**: Comprehensive crypto market information
- **TradingView**: Advanced charting widgets and technical analysis tools
- **Firebase**: Authentication, Firestore database, and cloud storage

### UI Libraries
- **Radix UI**: Accessible primitive components (@radix-ui/react-*)
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization and charting components
- **React Hook Form**: Form state management with validation

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire codebase
- **PostCSS**: CSS processing with Tailwind CSS integration

## Deployment Strategy

The application is configured for deployment on Replit with:

- **Development**: `npm run dev` runs the Express server with Vite dev middleware
- **Production Build**: `npm run build` creates optimized client and server bundles
- **Production Server**: `npm run start` serves the built application
- **Database**: PostgreSQL module configured in .replit for database provisioning
- **Port Configuration**: Server runs on port 5000 with external port 80 mapping
- **Autoscale Deployment**: Configured for automatic scaling based on traffic

### Build Process
1. Vite builds the client-side React application
2. ESBuild bundles the server with external package dependencies
3. Static assets are served from the dist/public directory
4. API routes are prefixed with /api for clear separation

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.