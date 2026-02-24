# Tip Harmony

A restaurant tip distribution calculator built for splitting tips among staff members (waiters, cooks, and dishwashers) based on predefined percentage allocations.

## Overview

Tip Harmony is a web application designed to simplify the process of distributing tips in a restaurant environment. It calculates per-person amounts based on total tips received and the number of staff in each role. The application features a modern React frontend and a robust Express backend with PostgreSQL for data persistence.

## Features

-   **Role-Based Distribution:** Automatically calculates tip shares for Waiters (75%), Cooks (20% or 25%), and Dishwashers (5% or 0%).
-   **Dynamic Adjustments:** Adapts distribution percentages based on the presence of dishwashers.
-   **History Tracking:** Stores calculation history for record-keeping.
-   **Modern UI:** Built with Shadcn UI and Tailwind CSS for a clean and responsive interface.
-   **Secure:** Uses Helmet for security headers and environment variables for sensitive configuration.

## Tech Stack

### Frontend
-   **Framework:** React 18 with TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS, Shadcn UI (Radix UI)
-   **State Management:** TanStack Query
-   **Routing:** Wouter
-   **Visualization:** Recharts

### Backend
-   **Server:** Express.js with TypeScript
-   **Database:** PostgreSQL
-   **ORM:** Drizzle ORM
-   **Validation:** Zod

## Prerequisites

-   Node.js (v20 or higher recommended)
-   PostgreSQL database (e.g., Supabase)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd tip-harmony
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2.  Update the `.env` file with your configuration:
    -   `DATABASE_URL`: Your PostgreSQL connection string.
    -   `VITE_SUPABASE_URL`: Your Supabase URL.
    -   `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key.
    -   `VITE_PIN_CODE`: Optional PIN code for application access (default: 2519).

## Database Setup

Initialize the database schema using Drizzle Kit:

```bash
npm run db:push
```

## Running the Application

### Development

Start the development server:

```bash
npm run dev
```
This will start the Vite development server, usually at `http://localhost:5173`.

### Production

Build and start the production server:

```bash
npm run build
npm start
```

## Testing

Run the test suite using Vitest:

```bash
npm run test
```

## Project Structure

-   `client/`: Frontend React application code.
-   `server/`: Backend Express server code.
-   `shared/`: Shared code between client and server (e.g., types, schemas).
-   `dist/`: compiled production build.

## License

This project is licensed under the MIT License.
