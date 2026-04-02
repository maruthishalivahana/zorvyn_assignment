# Zorvyn Assignment Backend

TypeScript + Express backend architecture with modular layers for config, models, controllers, services, middleware, routes, validators, and utilities.

## Setup

1. Install dependencies:
   npm install
2. Copy environment file:
   cp .env.example .env
3. Start development server:
   npm run dev

## Scripts

- npm run dev - Run with ts-node-dev
- npm run build - Compile TypeScript to dist/
- npm start - Run compiled app
- npm test - Run Jest tests

## Project Structure

- src/config - Environment, constants, database connection
- src/models - Mongoose models
- src/controllers - Route handlers
- src/services - Business logic
- src/middleware - Auth, role, validation, and error handlers
- src/routes - Express route modules
- src/validators - Request validators
- src/utils - Helper utilities
