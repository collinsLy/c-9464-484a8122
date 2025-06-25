# Vertex Trading Platform

## Overview

Vertex Trading is a comprehensive cryptocurrency trading platform built with React, TypeScript, and Firebase. The application provides a full-featured trading experience with real-time market data, automated trading bots, P2P trading, and various financial instruments including spot trading, futures, and options.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming and dark mode support
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router for client-side navigation
- **Charts**: TradingView widgets and Recharts for data visualization

### Backend Architecture
- **Authentication**: Firebase Authentication with email/password
- **Database**: Firebase Firestore for user data, trading history, and P2P transactions
- **Storage**: Firebase Storage for profile images and documents
- **Real-time Updates**: Firestore real-time subscriptions for live data

### Data Sources
- **Cryptocurrency Data**: Binance API for real-time prices and trading data
- **Alternative Data**: CoinGecko API for market information and historical data
- **Chart Data**: TradingView widgets for professional trading charts

## Key Components

### Trading System
- **Spot Trading**: Buy/sell cryptocurrencies with real-time order execution
- **Futures Trading**: USDT-M and Coin-M futures with leverage up to 125x
- **Options Trading**: Cryptocurrency options with Greeks calculations
- **Margin Trading**: Leveraged trading with cross and isolated margin modes
- **P2P Trading**: Peer-to-peer cryptocurrency trading with escrow system

### Automated Trading
- **Trading Bots**: Pre-configured bots with different risk/reward profiles
- **Strategy Builder**: Custom strategy creation with technical indicators
- **Copy Trading**: Follow and copy successful traders automatically
- **Backtesting**: Historical strategy testing with performance metrics

### Portfolio Management
- **Asset Overview**: Real-time portfolio valuation and performance tracking
- **Risk Analysis**: Portfolio concentration, correlation, and volatility metrics
- **Earning Products**: Staking, flexible savings, and liquidity farming
- **Auto-Invest**: Dollar-cost averaging with scheduled purchases

### Market Data & Analysis
- **Live Price Tickers**: Real-time cryptocurrency price feeds
- **Market Overview**: Comprehensive market data with sorting and filtering
- **DEX Screener**: New token listings from decentralized exchanges
- **News Integration**: Cryptocurrency market news and analysis

## Data Flow

### User Authentication Flow
1. User registers/logs in through Firebase Authentication
2. User profile data stored in Firestore with initial balance
3. Session managed through Firebase Auth state persistence
4. Demo mode toggle allows testing without real funds

### Trading Flow
1. Real-time price data fetched from Binance/CoinGecko APIs
2. User places order through trading interface
3. Order validation and balance checks performed
4. Transaction recorded in Firestore with timestamp
5. User balances updated atomically
6. Real-time notifications sent for order status

### P2P Trading Flow
1. Users create buy/sell offers with payment methods
2. Offers stored in Firestore with real-time subscriptions
3. Order matching based on price and payment preferences
4. Escrow system holds funds during transaction
5. Chat system enables buyer-seller communication
6. Automated dispute resolution with admin intervention

## External Dependencies

### APIs
- **Binance API**: Real-time cryptocurrency prices and trading data
- **CoinGecko API**: Market data, historical prices, and coin information
- **TradingView**: Professional charting widgets and technical analysis

### Firebase Services
- **Authentication**: User management and security
- **Firestore**: NoSQL database for application data
- **Storage**: File storage for images and documents
- **Hosting**: Web application deployment (optional)

### Payment Integrations
- **Cryptocurrency**: Native wallet integrations for deposits/withdrawals
- **Fiat Gateways**: Credit card and bank transfer processing
- **Mobile Money**: M-Pesa and Airtel Money for African markets

## Deployment Strategy

### Development Environment
- Local development server on port 5000
- Hot module replacement for fast development cycles
- Proxy configuration for API calls to external services
- Firebase emulators for local testing (optional)

### Production Build
- Vite build optimization with code splitting
- Manual chunk splitting for vendor libraries
- PWA support with service worker registration
- Static hosting on Vercel with SPA routing

### Environment Configuration
- Development and production Firebase projects
- API keys managed through environment variables
- CORS configuration for external API access
- SSL/TLS encryption for all communications

## Changelog

- June 25, 2025. Initial setup
- June 25, 2025. Crypto converter feature confirmed on restored-converter-feature branch
  - Full conversion functionality between 13+ cryptocurrencies
  - Real-time rate fetching from CoinGecko API with 18-second refresh
  - Complete Firebase integration for balances and transaction history
  - Professional UI with currency icons and swap functionality

## User Preferences

Preferred communication style: Simple, everyday language.