# Overview

This is a full-stack content management and social media publishing platform built with Express.js, React, and PostgreSQL. The application provides a dashboard for managing digital assets (reels, carousels, posts) with automated publishing workflows to multiple social media platforms. It features real-time status updates, scheduling capabilities, and comprehensive asset management with support for different content types and publishing destinations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built with **React 18** using **Vite** as the build tool and development server. The application uses a modern React stack with:

- **TypeScript** for type safety throughout the codebase
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query (React Query)** for server state management, caching, and synchronization
- **Radix UI primitives** with **shadcn/ui** components for a consistent, accessible design system
- **Tailwind CSS** for utility-first styling with custom CSS variables for theming
- **Real-time WebSocket integration** for live updates of asset statuses and workflow progress

The architecture follows a component-based pattern with clear separation between UI components, business logic hooks, and API communication layers. Form handling is managed through React Hook Form with Zod validation schemas.

## Backend Architecture

The server uses **Express.js** with TypeScript in ESM format, providing:

- **RESTful API endpoints** for CRUD operations on assets, destinations, and workflows
- **WebSocket server** using the `ws` library for real-time bidirectional communication
- **Modular route organization** with centralized error handling middleware
- **Storage abstraction layer** that defines interfaces for all database operations
- **Request/response logging** with performance monitoring for API endpoints

The backend is designed to handle both HTTP requests and WebSocket connections on the same server instance, enabling seamless real-time updates for dashboard statistics and asset status changes.

## Data Layer

The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations:

- **Drizzle-Kit** for database migrations and schema management
- **Neon Database** integration for serverless PostgreSQL hosting
- **Schema-first approach** with shared TypeScript types between client and server
- **Relational data modeling** for assets, destinations, workflows, and user management

Key tables include assets (with metadata), destinations (social media accounts), asset_destinations (many-to-many publishing targets), workflows (automation processes), and users. The schema supports different asset types (reels, carousels, posts) with flexible JSON metadata storage.

## State Management

The application implements a hybrid state management approach:

- **Server State**: Managed by TanStack Query with automatic caching, background refetching, and optimistic updates
- **WebSocket State**: Real-time updates broadcast to all connected clients for immediate UI synchronization
- **Local State**: React's built-in useState and useReducer for component-specific state
- **Form State**: React Hook Form for complex form interactions with validation

## Authentication & Authorization

The current implementation includes user schema and basic user management endpoints, preparing for session-based authentication with:

- User registration and login functionality
- Session management for maintaining authenticated state
- Role-based access control for different user types
- Secure password handling and validation

## Workflow Integration

The system is designed to integrate with external automation tools:

- **n8n webhook endpoints** for triggering publishing workflows
- **Event-driven architecture** for tracking workflow progress and status changes
- **Flexible workflow types** (publish_now, schedule, bulk_operations)
- **Error handling and retry mechanisms** for failed publishing attempts

# External Dependencies

## Database & ORM
- **Neon Database** - Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM** - Type-safe SQL query builder and schema management
- **Drizzle-Kit** - Database migration and introspection tools

## UI & Design System
- **Radix UI** - Unstyled, accessible component primitives for complex UI patterns
- **shadcn/ui** - Pre-built component library built on Radix UI with Tailwind styling
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Lucide React** - Icon library for consistent iconography

## Development & Build Tools
- **Vite** - Fast build tool and development server with HMR
- **TypeScript** - Static type checking and enhanced developer experience
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Autoprefixer for cross-browser compatibility

## Data Fetching & Real-time
- **TanStack Query** - Server state management with caching and synchronization
- **WebSocket (ws)** - Real-time bidirectional communication for live updates
- **React Hook Form** - Performance-focused form library with minimal re-renders

## Validation & Type Safety
- **Zod** - Runtime type validation and schema definition
- **Drizzle-Zod** - Integration between Drizzle schemas and Zod validation

## Automation & Integrations
- **n8n** - Workflow automation platform for publishing to social media platforms
- **External APIs** - Instagram, TikTok, LinkedIn, and other social media platform APIs (integrated via n8n)

## Utility Libraries
- **date-fns** - Date manipulation and formatting utilities
- **clsx & tailwind-merge** - Conditional CSS class name management
- **nanoid** - URL-safe unique ID generation for resources