# Zorvyn Finance Backend API

This is the backend I built for a finance operations assignment. The API covers user authentication, invite-based onboarding, role-based access, record management, and dashboard analytics.

The goal was to keep the code clean, modular, and easy to test while still being practical for deployment.

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)

## 1. Project Overview

### What This API Does

This backend supports:

- User authentication with JWT + HTTP-only cookies
- Invite flow for onboarding new users
- Role-based authorization (`viewer`, `analyst`, `admin`)
- Record CRUD with soft delete
- Dashboard reporting (summary, trends, category breakdown, recent activity)

### Why I Built It This Way

I wanted a structure that is straightforward for reviewers to navigate:

- routes for URL mapping
- controllers for request/response handling
- services for business logic
- validators for schema checks
- middleware for auth, roles, and errors

## 2. Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Table of Contents](#2-table-of-contents)
- [3. Getting Started](#3-getting-started)
- [4. Environment Configuration](#4-environment-configuration)
- [5. Database Setup](#5-database-setup)
- [6. Run Commands](#6-run-commands)
- [7. API Endpoints](#7-api-endpoints)
- [8. Authentication and Authorization](#8-authentication-and-authorization)
- [9. Error Handling](#9-error-handling)
- [10. Data Models](#10-data-models)
- [11. Deployment](#11-deployment)
- [12. Technical Decisions and Trade-offs](#12-technical-decisions-and-trade-offs)
- [13. Additional Notes](#13-additional-notes)

## 3. Getting Started

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 22+ recommended |
| npm | 10+ recommended |
| MongoDB | Local instance or Atlas |

### Installation

1. Clone the repository

```bash
git clone https://github.com/maruthishalivahana/zorvyn_assignment
cd zorvyn_assignment
```

2. Install dependencies

```bash
npm install
```

3. Create your env file

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Fill in required values in `.env` (`MONGODB_URI`, `JWT_SECRET`, and mail config)

## 4. Environment Configuration

### `.env.example`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=change_me
JWT_EXPIRES_IN=1d
EMAIL_FROM=your_email@example.com
EMAIL_FROM_NAME=Finance Dashboard
API_BASE_URL=http://localhost:5000
BREVO_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_SERVICE=
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_app_password
AUTH_COOKIE_NAME=auth_token
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_MAX_AGE_MS=86400000
```

### Variable Reference

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Runtime environment |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/zorvyn` | MongoDB connection string |
| `JWT_SECRET` | Yes | `""` | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `1d` | JWT expiration |
| `EMAIL_FROM` | No | `noreply@example.com` | Sender email |
| `EMAIL_FROM_NAME` | No | `Zorvyn` | Sender display name |
| `API_BASE_URL` | No | `http://localhost:5000` | Used in invite message content |
| `BREVO_API_KEY` | No | `""` | If set, email is sent using Brevo API |
| `SMTP_HOST` | No | `""` | SMTP host |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | SMTP TLS mode |
| `SMTP_SERVICE` | No | `""` | Optional SMTP service (example: `gmail`) |
| `SMTP_USER` | No | `""` | SMTP username |
| `SMTP_PASS` | No | `""` | SMTP password/app key |
| `AUTH_COOKIE_NAME` | No | `auth_token` | Auth cookie name |
| `AUTH_COOKIE_SECURE` | No | `NODE_ENV === production` | Cookie secure flag |
| `AUTH_COOKIE_SAME_SITE` | No | `lax` | Cookie sameSite setting |
| `AUTH_COOKIE_DOMAIN` | No | `""` | Cookie domain |
| `AUTH_COOKIE_MAX_AGE_MS` | No | `86400000` | Cookie TTL |

## 5. Database Setup

### Database

- MongoDB (via Mongoose)

### Steps

1. Make sure MongoDB is running (local or Atlas)
2. Set `MONGODB_URI` in `.env`
3. Start the app; DB connection happens during boot

### Migrations / Seed

- No migration tool added yet
- No dedicated seed script yet
- You can create users via `POST /api/auth/register` or invite flow

## 6. Run Commands

### Development

```bash
npm run dev
```

### Build and Run

```bash
npm run build
npm start
```

### Test

```bash
npm test
```

### Health Check

- Endpoint: `GET /health`

Expected response:

```json
{
  "success": true,
  "message": "API is healthy"
}
```

## 7. API Endpoints

Base path: `/api`

### 7.1 Auth

#### `POST /api/auth/register`

Register a user.

Sample body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePass123",
  "role": "admin"
}
```

#### `POST /api/auth/login`

Login and get authenticated (cookie + token support).

Sample body:

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```

#### `POST /api/auth/logout`

Logout current authenticated user.

### 7.2 Invites

#### `POST /api/invites`

Send invite (admin only).

```json
{
  "email": "analyst@example.com",
  "role": "analyst",
  "customMessage": "Welcome to the finance team"
}
```

#### `GET /api/invites/validate/:token`

Validate invite token.

#### `POST /api/invites/accept`

Accept invite and create account.

```json
{
  "token": "invite-token",
  "name": "Sarah Analyst",
  "password": "SecurePass123"
}
```

### 7.3 Users

#### `GET /api/users`

List users (admin only). Supports `page`, `limit`, `role`, `status`.

#### `GET /api/users/me`

Get current user profile.

#### `GET /api/users/:id`

Get user by id (admin only).

#### `PATCH /api/users/:id/status`

Update account status (admin only).

```json
{
  "status": "inactive"
}
```

#### `DELETE /api/users/:id`

Delete user (admin only).

### 7.4 Records

#### `POST /api/records`

Create record (admin only).

```json
{
  "title": "Team Lunch",
  "type": "expense",
  "category": "food",
  "amount": 120.5,
  "description": "Monthly team lunch",
  "date": "2026-04-02T10:00:00.000Z"
}
```

#### `GET /api/records`

List records (analyst/admin).

#### `GET /api/records/summary`

Summary for records (analyst/admin).

#### `GET /api/records/:id`

Get one record (analyst/admin).

#### `PATCH /api/records/:id`

Update record (admin only).

#### `DELETE /api/records/:id`

Soft delete record (admin only).

### 7.5 Dashboard

Dashboard endpoints are read-only for all active roles.

#### `GET /api/dashboard`

Alias for dashboard summary.

#### `GET /api/dashboard/summary`

Overall totals and averages.

#### `GET /api/dashboard/category-breakdown`

Query: `type`, `startDate`, `endDate`

#### `GET /api/dashboard/trends`

Query: `period`, `months`

#### `GET /api/dashboard/recent-activity`

Query: `limit`

### 7.6 Endpoint Access Matrix

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authenticated |
| POST | `/api/invites` | Admin |
| GET | `/api/invites/validate/:token` | Public |
| POST | `/api/invites/accept` | Public |
| GET | `/api/users` | Admin |
| GET | `/api/users/me` | Authenticated |
| GET | `/api/users/:id` | Admin |
| PATCH | `/api/users/:id/status` | Admin |
| DELETE | `/api/users/:id` | Admin |
| POST | `/api/records` | Admin |
| GET | `/api/records` | Analyst, Admin |
| GET | `/api/records/summary` | Analyst, Admin |
| GET | `/api/records/:id` | Analyst, Admin |
| PATCH | `/api/records/:id` | Admin |
| DELETE | `/api/records/:id` | Admin |
| GET | `/api/dashboard` | Viewer, Analyst, Admin |
| GET | `/api/dashboard/summary` | Viewer, Analyst, Admin |
| GET | `/api/dashboard/category-breakdown` | Viewer, Analyst, Admin |
| GET | `/api/dashboard/trends` | Viewer, Analyst, Admin |
| GET | `/api/dashboard/recent-activity` | Viewer, Analyst, Admin |

## 8. Authentication and Authorization

### Authentication

- JWT tokens signed with `JWT_SECRET`
- Login sets HTTP-only cookie (`AUTH_COOKIE_NAME`)
- Protected routes accept cookie token and Bearer token

### Roles

- `viewer`: dashboard read-only
- `analyst`: dashboard + records read
- `admin`: full access

### Account Status Rule

Inactive users are blocked with `403 Account is inactive`.

## 9. Error Handling

### Response Format

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Common Status Codes

| Code | Meaning |
| --- | --- |
| `200` | OK |
| `201` | Created |
| `400` | Validation / bad request |
| `401` | Unauthorized |
| `403` | Forbidden / inactive user |
| `404` | Not found |
| `409` | Conflict |
| `500` | Internal server error |

## 10. Data Models

### User

```json
{
  "id": "userObjectId",
  "email": "user@example.com",
  "name": "User Name",
  "role": "viewer",
  "status": "active",
  "lastLoginAt": null,
  "createdAt": "2026-04-04T09:00:00.000Z"
}
```

### Invite

```json
{
  "email": "invitee@example.com",
  "token": "uuid-token",
  "role": "analyst",
  "status": "pending",
  "invitedBy": "adminObjectId",
  "expiresAt": "2026-04-11T09:00:00.000Z",
  "acceptedAt": null,
  "customMessage": "Welcome"
}
```

### Record

```json
{
  "_id": "recordObjectId",
  "title": "Team Lunch",
  "type": "expense",
  "category": "food",
  "amount": 120.5,
  "date": "2026-04-02T10:00:00.000Z",
  "description": "Monthly team lunch",
  "userId": "userObjectId",
  "isDeleted": false,
  "deletedAt": null,
  "deletedBy": null
}
```

### Dashboard Summary Shape

```json
{
  "summary": {
    "totalIncome": 5400,
    "totalExpenses": 1300,
    "netBalance": 4100,
    "transactionCount": {
      "income": 3,
      "expense": 5
    },
    "averageTransaction": {
      "income": 1800,
      "expense": 260
    }
  },
  "period": {
    "startDate": "all",
    "endDate": "all"
  }
}
```

## 11. Deployment

### Live API

- `https://zorvyn-assignment-w267.onrender.com`

### Render Notes

Set the following environment values in Render:

```env
NODE_ENV=production
API_BASE_URL=https://zorvyn-assignment-w267.onrender.com
AUTH_COOKIE_SECURE=true
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
EMAIL_FROM=your_verified_sender@example.com
EMAIL_FROM_NAME=Finance Dashboard
BREVO_API_KEY=your_brevo_api_key
```

If you are using SMTP instead of Brevo API, set SMTP variables and make sure your hosting provider allows outbound SMTP.

## 12. Technical Decisions and Trade-offs

### Express + TypeScript

I chose Express + TypeScript because it gives me control over request flow without forcing a heavy framework. TypeScript helped catch mistakes early, but the trade-off is more setup and stricter build checks.

### MongoDB + Mongoose

MongoDB was a practical fit for this assignment because invites, users, and records map nicely to document models. Mongoose gave me schema validation and hooks, but the trade-off is less strict relational integrity compared to SQL.

### JWT with Cookie + Bearer Support

I implemented JWT authentication with HTTP-only cookies for browser safety, and Bearer token support for Postman/testing convenience. This keeps usage flexible, but token lifecycle handling is still simpler than a full session store.

### Layered Architecture

I separated routes, controllers, services, middleware, models, and validators so the code is easier to maintain and test. It adds a little boilerplate, but it scales better than mixing everything in route files.

### Invite Workflow

I used invite token persistence in database with status tracking (`pending`, `accepted`, `expired`) so onboarding is traceable. This is robust, but it introduces dependency on mail provider/network health.

## 13. Additional Notes

### Known Limitations

- No migration framework yet
- No queue/retry system for email jobs
- Logging is basic (console + morgan)

### Setup and Runtime Notes

- Keep all secrets in environment variables
- Ensure CORS and cookie security are aligned with frontend origin in production
- Verify sender/domain in your mail provider for reliable delivery

### What I Would Improve Next

- Add background job queue for emails
- Add stronger observability (structured logs, alerting)
- Expand automated tests around role-access and invite edge cases
