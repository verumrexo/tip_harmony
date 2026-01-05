# Tip Calculator Application

## Overview

This is a restaurant tip distribution calculator built for splitting tips among staff members (waiters, cooks, and dishwashers) based on predefined percentage allocations. The application calculates per-person amounts based on total tips received and the number of staff in each role. It features a React frontend with a modern UI component library and an Express backend with PostgreSQL for persistent storage of calculation history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (warm earthy color palette inspired by "Gril Restorans" branding)
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- Reusable UI components in `client/src/components/ui/`
- Custom application components in `client/src/components/`
- Custom hooks for data fetching in `client/src/hooks/`
- Pages in `client/src/pages/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas
- **Build Process**: Custom esbuild script for production bundling

The backend uses a storage abstraction layer (`server/storage.ts`) that interfaces with the database through Drizzle ORM.

### Shared Code
- **Schema Definitions**: `shared/schema.ts` contains Drizzle table definitions and Zod schemas
- **Route Definitions**: `shared/routes.ts` contains typed API route definitions with input/output schemas
- This pattern enables type-safe API contracts between frontend and backend

### Data Model
The core entity is `calculations` which stores:
- Total tip amount
- Staff counts (waiters, cooks, dishwashers)
- Calculated per-person amounts for each role
- Timestamp for history tracking

### Business Logic
Tip distribution follows fixed percentages:
- Waiters: 75% of total
- Cooks: 20% (or 25% if no dishwashers)
- Dishwashers: 5% (or 0% if none present)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (`npm run db:push` for schema synchronization)

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` / `drizzle-zod`: Database ORM with Zod schema generation
- `express`: HTTP server framework
- `zod`: Runtime type validation
- `date-fns`: Date formatting utilities
- `lucide-react`: Icon library

### Development Tools
- Vite with HMR for development
- TSX for running TypeScript directly
- Replit-specific plugins for development experience (`@replit/vite-plugin-*`)