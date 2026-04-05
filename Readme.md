# Zorvyn Finance Backend API

TypeScript + Express backend for user onboarding, invitation workflow, role-based access control, record management, and financial dashboard analytics.

![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)

## 1. Project Overview

### Purpose

This API powers a finance operations backend with:

- Authentication and secure session handling (JWT + HTTP-only cookies)
- Invite-based account onboarding
- Role-based authorization (`viewer`, `analyst`, `admin`)
- Record CRUD and analytics dashboards

### Key Features

- Cookie-first authentication with bearer token compatibility
- Modular Express architecture (routes/controllers/services/validators)
- Zod request validation
- Mongoose models with indexing and soft delete for records
- Dashboard aggregations: totals, trends, category breakdown, recent activity

### Technology Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| HTTP Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`) + `cookie-parser` |
| Security | `helmet`, `cors` |
| Logging | `morgan` + custom logger |
| Email | Nodemailer |

### API Version

- Current version: `v1` (unversioned paths under `/api/*`)

## 2. Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Table of Contents](#2-table-of-contents)
- [3. Getting Started](#3-getting-started)
- [4. Environment Configuration](#4-environment-configuration)
- [5. Database Setup](#5-database-setup)
- [6. Running the Application](#6-running-the-application)
- [7. API Endpoints Documentation](#7-api-endpoints-documentation)
- [8. Authentication and Authorization](#8-authentication-and-authorization)
- [9. Error Handling](#9-error-handling)
- [10. Data Models and Schemas](#10-data-models-and-schemas)
- [11. Deployment](#11-deployment)

## 3. Getting Started

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 22+ recommended |
| npm | 10+ recommended |
| MongoDB | 6+ or MongoDB Atlas |

### Installation Steps

1. Clone repository

```bash
git clone <your-repository-url>
cd zorvyn_assignment
```

2. Install dependencies

```bash
npm install
```

3. Create environment file

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Set required values in `.env` (especially `MONGODB_URI` and `JWT_SECRET`)

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
| `NODE_ENV` | No | `development` | App environment |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/zorvyn` | MongoDB connection string |
| `JWT_SECRET` | Yes | `""` | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `1d` | JWT expiry passed to `jsonwebtoken` |
| `EMAIL_FROM` | No | `noreply@example.com` | Sender email |
| `EMAIL_FROM_NAME` | No | `Zorvyn` | Sender display name |
| `API_BASE_URL` | No | `http://localhost:5000` | Base URL used in invite email content |
| `SMTP_HOST` | No | `""` | SMTP host for sending invite emails |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | Use TLS for SMTP |
| `SMTP_SERVICE` | No | `""` | Optional provider shortcut, e.g. `gmail` |
| `SMTP_USER` | No | `""` | SMTP username |
| `SMTP_PASS` | No | `""` | SMTP password |
| `AUTH_COOKIE_NAME` | No | `auth_token` | Auth cookie key |
| `AUTH_COOKIE_SECURE` | No | `NODE_ENV === production` | Cookie `secure` flag |
| `AUTH_COOKIE_SAME_SITE` | No | `lax` | Cookie `sameSite` (`lax`, `strict`, `none`) |
| `AUTH_COOKIE_DOMAIN` | No | `""` | Cookie domain scope |
| `AUTH_COOKIE_MAX_AGE_MS` | No | `86400000` | Auth cookie TTL in milliseconds |

## 5. Database Setup

### Database Type

- MongoDB via Mongoose

### Initial Setup

1. Ensure MongoDB is running (local or Atlas)
2. Set `MONGODB_URI` in `.env`
3. Start the app; DB connection is established automatically on boot

### Migrations and Seed Data

- This project does not currently use migration tooling
- No formal seed command is defined
- Create initial users via `POST /api/auth/register` or invite workflow

## 6. Running the Application

### Development

```bash
npm run dev
```

### Production

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
- Expected response:

```json
{
   "success": true,
   "message": "API is healthy"
}
```

## 7. API Endpoints Documentation

Base path for API routes: `/api`

### 7.1 Auth Endpoints

#### `POST /api/auth/register`

- Description: Register a new user
- Auth required: No
- Request body:

```json
{
   "name": "Admin User",
   "email": "admin@example.com",
   "password": "SecurePass123",
   "role": "admin"
}
```

- Validation:
   - `name`: 2-100 chars
   - `email`: valid email
   - `password`: min 8 chars, uppercase + lowercase + number
   - `role`: optional, one of `viewer|analyst|admin`

#### `POST /api/auth/login`

- Description: Authenticate user and set auth cookie
- Auth required: No
- Request body:

```json
{
   "email": "admin@example.com",
   "password": "SecurePass123"
}
```

- Success notes:
   - Sets HTTP-only auth cookie
   - Returns basic user profile in response body

#### `POST /api/auth/logout`

- Description: Clears auth cookie
- Auth required: Yes

### 7.2 Invite Endpoints

#### `POST /api/invites`

- Description: Send invite to new user
- Auth required: Yes (`admin`)
- Request body:

```json
{
   "email": "analyst@example.com",
   "role": "analyst",
   "customMessage": "Welcome to the finance team"
}
```

#### `GET /api/invites/validate/:token`

- Description: Validate invite token before acceptance
- Auth required: No

#### `POST /api/invites/accept`

- Description: Accept invite and create account
- Auth required: No
- Request body:

```json
{
   "token": "invite-token",
   "name": "Sarah Analyst",
   "password": "SecurePass123"
}
```

### 7.3 User Endpoints

#### `GET /api/users`

- Description: List users with pagination/filter
- Auth required: Yes (`admin`)
- Query:
   - `page` (default `1`)
   - `limit` (default `20`, max `100`)
   - `role` (`viewer|analyst|admin`)
   - `status` (`active|inactive`)

#### `GET /api/users/me`

- Description: Current user profile
- Auth required: Yes (any role)

#### `GET /api/users/:id`

- Description: Get user by ID
- Auth required: Yes (`admin`)

#### `PATCH /api/users/:id/status`

- Description: Activate/deactivate user
- Auth required: Yes (`admin`)
- Request body:

```json
{
   "status": "inactive"
}
```

#### `DELETE /api/users/:id`

- Description: Delete user
- Auth required: Yes (`admin`)

### 7.4 Record Endpoints

#### `POST /api/records`

- Description: Create financial record
- Auth required: Yes (`admin`)
- Request body:

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

- Description: List records
- Auth required: Yes (`analyst|admin`)
- Query:
   - `page`, `limit`
   - `type` (`income|expense`)
   - `category`
   - `startDate`, `endDate`

#### `GET /api/records/summary`

- Description: Aggregate record summary
- Auth required: Yes (`analyst|admin`)

#### `GET /api/records/:id`

- Description: Get record by ID
- Auth required: Yes (`analyst|admin`)

#### `PATCH /api/records/:id`

- Description: Update record fields
- Auth required: Yes (`admin`)

#### `DELETE /api/records/:id`

- Description: Soft-delete record
- Auth required: Yes (`admin`)

### 7.5 Dashboard Endpoints

All dashboard routes are read-only and available to all active roles (`viewer|analyst|admin`).

#### `GET /api/dashboard`

- Alias of summary endpoint

#### `GET /api/dashboard/summary`

- Description: Global totals (`totalIncome`, `totalExpenses`, `netBalance`, averages)
- Query (optional): `startDate`, `endDate`
- Behavior:
   - If no date range is provided, summary is calculated over all records

#### `GET /api/dashboard/category-breakdown`

- Query:
   - `type` (`income|expense|all`, default `all`)
   - `startDate`, `endDate` (optional)

#### `GET /api/dashboard/trends`

- Query:
   - `period` (`monthly|weekly`, default `monthly`)
   - `months` (`1-12`, default `6`)

#### `GET /api/dashboard/recent-activity`

- Query:
   - `limit` (`1-50`, default `10`)

### 7.6 Endpoint Summary Table

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

### Authentication Mechanism

- JWT tokens signed with `JWT_SECRET`
- Login sets JWT as HTTP-only cookie (`AUTH_COOKIE_NAME`)
- Protected middleware accepts:
   - Cookie token (preferred)
   - `Authorization: Bearer <token>` (backward compatibility)

### Token Expiration

- Controlled by `JWT_EXPIRES_IN` (default `1d`)

### Roles

- `viewer`: Dashboard read-only access
- `analyst`: Dashboard read-only + records read access
- `admin`: Full access

### Account Status Check

- Inactive users are blocked with `403 Account is inactive`

## 9. Error Handling

### Standard Response Shapes

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

### Common HTTP Status Codes

| Code | Meaning |
| --- | --- |
| `200` | OK |
| `201` | Created |
| `400` | Bad request / validation error |
| `401` | Unauthorized / invalid token |
| `403` | Forbidden / inactive account |
| `404` | Resource or route not found |
| `409` | Conflict (already exists / pending invite) |
| `500` | Internal server error |

## 10. Data Models and Schemas

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

Constraints:

- Email unique, normalized lowercase
- Password min 8 chars (hashed by pre-save hook)
- Role: `viewer|analyst|admin`
- Status: `active|inactive`

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

Constraints:

- `title`: 1-100 chars
- `type`: `income|expense`
- `category`: 2-50 chars, normalized lowercase
- `amount`: positive with max 2 decimals
- `description`: max 500 chars
- Soft-delete enabled (`isDeleted`)

### Dashboard Summary Data Shape

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

### Deployed API Base URL

- Not specified in this repository
- Use environment-based base URL:

```text
API_BASE_URL=https://zorvyn-assignment-w267.onrender.com
```

For production, set `API_BASE_URL` to your deployed domain and ensure:

- `NODE_ENV=production`
- `AUTH_COOKIE_SECURE=true`
- Proper CORS origin policy configuration

### Render / Production Environment Variables

If you deploy on Render and use Gmail for invite emails, set:

```env
NODE_ENV=production
API_BASE_URL=https://your-deployed-api-url
AUTH_COOKIE_SECURE=true
SMTP_SERVICE=gmail
SMTP_USER=your_gmail_address
SMTP_PASS=your_google_app_password
EMAIL_FROM=your_gmail_address
EMAIL_FROM_NAME=Finance Dashboard
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Notes:

- Use a Google App Password, not your normal Gmail password.
- `SMTP_SERVICE=gmail` is enough for Nodemailer; `SMTP_HOST` and `SMTP_PORT` are optional when using the service shortcut.
- Make sure your Render service build command runs `npm run build` before `npm start`.
