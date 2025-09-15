# Expense Tracker Application

## Overview

This is a modern expense tracking web application built with a full-stack architecture. The application allows users to manage their expenses by creating, viewing, editing, and deleting expense records organized by categories. It features a clean, responsive user interface with real-time data updates and comprehensive expense analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management, caching, and synchronization
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type consistency
- **API Design**: RESTful API with JSON responses
- **Request Processing**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database queries and migrations
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Connection**: Connection pooling with Neon serverless for optimal performance

### Database Schema Design
- **Categories Table**: Stores expense categories with color coding and icons
- **Expenses Table**: Main expense records with foreign key relationships to categories
- **Relationships**: One-to-many relationship between categories and expenses
- **Data Types**: Decimal precision for monetary values, timestamps for audit trails

### Development Architecture
- **Build System**: Vite for fast development builds and hot module replacement
- **Development Server**: Integrated Vite middleware for seamless full-stack development
- **Production Build**: ESBuild for server bundling, Vite for client optimization
- **Type Checking**: Shared TypeScript configuration across client and server

### Authentication and Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Session Security**: HTTP-only cookies with proper security headers
- **Data Validation**: Zod schemas for request validation and type inference

### Code Organization Patterns
- **Monorepo Structure**: Shared types and schemas between client and server
- **Component Architecture**: Reusable UI components with proper separation of concerns
- **Custom Hooks**: React hooks for data fetching and UI state management
- **Path Aliases**: TypeScript path mapping for clean import statements

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library with consistent design language
- **shadcn/ui**: Pre-built component library based on Radix UI

### Development Tools
- **Vite**: Build tool with React plugin and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation library for runtime type checking
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **date-fns**: Date utility library for formatting and manipulation

### Development Environment
- **Replit Integration**: Development plugins for runtime error overlay and debugging
- **TypeScript**: Full-stack type safety with shared configurations
- **ESLint Ready**: Configured for modern React and TypeScript development