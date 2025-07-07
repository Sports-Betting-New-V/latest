# Sports Betting Simulator - Replit Guide

## Overview

This is a comprehensive full-stack sports betting simulator built with modern web technologies. The application combines real-time sports data, AI-powered predictions, and sophisticated betting mechanics to provide users with a realistic sports betting experience using virtual currency.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Theme**: Full dark/light mode support with system preference detection
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage for demo purposes
- **API**: RESTful endpoints for authentication, games, predictions, and betting

### UI Component System
- **Design System**: shadcn/ui with "new-york" style
- **Base Colors**: Neutral theme with CSS custom properties
- **Components**: Comprehensive set including cards, forms, navigation, modals, and data display components
- **Responsive**: Mobile-first design with breakpoint-based layouts

## Key Components

### Authentication System
- Demo user credentials: `username: angel`, `password: angel1004`
- Simple username/password authentication
- Session persistence in localStorage
- Protected routes with authentication checks

### Game Management
- Support for multiple sports (NBA, NFL, MLB, NHL)
- Real-time game data structure with teams, scores, and betting lines
- Game status tracking (upcoming, live, completed)
- Betting odds for spreads, moneylines, and totals

### AI Prediction Engine
- Integration with OpenAI GPT-4o for intelligent betting recommendations
- Confidence scoring system (1-100)
- Edge score calculation (1-10)
- Detailed reasoning for each prediction
- Multiple bet type recommendations (spread, moneyline, total)

### Betting System
- Virtual bankroll starting at $10,000
- Bet placement with validation
- Real-time odds calculation
- Payout processing and settlement
- Comprehensive bet history tracking

### Analytics Dashboard
- User performance metrics (win rate, ROI, profit/loss)
- Interactive charts and visualizations
- Betting pattern analysis
- Real-time statistics updates

## Data Flow

1. **Initialization**: Demo data is loaded including users, games, and initial predictions
2. **User Authentication**: Simple credential check against demo user
3. **Game Data**: Games are fetched and displayed with current betting lines
4. **AI Predictions**: OpenAI generates recommendations for each game
5. **Bet Placement**: Users select bets, validate bankroll, and place wagers
6. **Game Simulation**: Results are simulated for completed games
7. **Settlement**: Winning bets are calculated and bankrolls updated
8. **Analytics**: User statistics are recalculated and displayed

## External Dependencies

### Core Framework Dependencies
- React 18 with TypeScript support
- Express.js for backend API
- Drizzle ORM for database operations
- TanStack Query for data fetching
- Wouter for routing

### UI and Styling
- Tailwind CSS for utility-first styling
- Radix UI primitives for accessible components
- Lucide React for icons
- Class Variance Authority for component variants

### AI Integration
- OpenAI SDK for GPT-4o predictions
- Environment variable configuration for API keys

### Database
- PostgreSQL as primary database
- Neon Database for serverless PostgreSQL
- Drizzle Kit for schema management and migrations

## Deployment Strategy

### Development
- Vite dev server for frontend hot reloading
- tsx for TypeScript execution in development
- Automatic error overlay and debugging tools
- Replit-specific development enhancements

### Production Build
- Vite builds optimized frontend bundle
- esbuild compiles backend for Node.js
- Static file serving through Express
- Environment-based configuration

### Database Setup
- Drizzle migrations for schema deployment
- Environment variable for DATABASE_URL
- Automatic demo data initialization on startup

## User Preferences

Preferred communication style: Simple, everyday language.
Backend preference: CommonJS modules (require/module.exports) instead of ES modules.

✅ **IMPLEMENTED**: Backend fully converted to CommonJS (.cjs files) using require/module.exports syntax.

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Attempted CommonJS conversion - project configured as ES module, would require full restructure
- July 07, 2025. ✅ Successfully converted entire backend to CommonJS (.cjs files) using require/module.exports