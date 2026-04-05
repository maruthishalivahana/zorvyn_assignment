# Records API Documentation

## Overview
Complete CRUD API for managing financial records with role-based access control, filtering, and pagination.

### Role Permissions
- **Viewer**: Can only view their own records. No create/update/delete permissions.
- **Analyst**: Can read all records and access summary statistics. Cannot create, update, or delete.
- **Admin**: Full management access. Can create, read, update, delete any record and view all summaries.

---

## API Endpoints

### 1. Create Record
**Endpoint**: `POST /api/records`  
**Authorization**: Admin only  
**Description**: Create a new financial record (admin only)

#### Request Body
```json
{
  "title": "Office Supplies Purchase",
  "type": "expense",
  "category": "supplies",
  "amount": 49.99,
  "description": "Monthly office supplies restock",
  "date": "2026-04-02T10:30:00Z"
}
```

#### Validation Rules
- `title`: Required, 1-100 characters
- `type`: Required, must be "income" or "expense"
- `category`: Required, 2-50 characters (converted to lowercase)
- `amount`: Required, positive number with max 2 decimal places
- `description`: Optional, max 500 characters
- `date`: Optional, ISO 8601 date format (defaults to current date)

#### Success Response (201)
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "title": "Office Supplies Purchase",
    "type": "expense",
    "category": "supplies",
    "amount": 49.99,
    "description": "Monthly office supplies restock",
    "date": "2026-04-02T10:30:00.000Z",
    "userId": "550e8400e29b41d4a716446655440000",
    "isDeleted": false,
    "createdAt": "2026-04-02T14:20:30.000Z",
    "updatedAt": "2026-04-02T14:20:30.000Z"
  }
}
```

#### Error Responses
- `400`: Validation error
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (viewer role cannot create)

---

### 2. List Records
**Endpoint**: `GET /api/records`  
**Authorization**: All authenticated users  
**Description**: Get paginated list of records with optional filtering

#### Query Parameters
- `page`: Page number (default: 1, must be positive integer)
- `limit`: Records per page (default: 20, max: 100)
- `type`: Filter by type ("income" or "expense")
- `category`: Filter by category (case-insensitive)
- `startDate`: Filter records from this date (ISO 8601 format)
- `endDate`: Filter records until this date (ISO 8601 format)

#### Examples
```bash
# Get first page of all records
GET /api/records

# Get expenses in 'supplies' category
GET /api/records?type=expense&category=supplies

# Get records for a date range
GET /api/records?startDate=2026-01-01T00:00:00Z&endDate=2026-04-02T23:59:59Z

# Custom pagination
GET /api/records?page=2&limit=50&type=income
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "records": [
      {
        "_id": "660a1b2c3d4e5f6g7h8i9j0k",
        "title": "Office Supplies Purchase",
        "type": "expense",
        "category": "supplies",
        "amount": 49.99,
        "date": "2026-04-02T10:30:00.000Z",
        "userId": "550e8400e29b41d4a716446655440000",
        "createdAt": "2026-04-02T14:20:30.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "pages": 3
    }
  }
}
```

#### Notes
- **Viewers**: Only see their own records
- **Analysts/Admins**: See all records (unless filtering by specific criteria)

---

### 3. Get Single Record
**Endpoint**: `GET /api/records/:id`  
**Authorization**: All authenticated users  
**Description**: Retrieve a single record by ID

#### URL Parameters
- `id`: Record MongoDB ObjectId (required)

#### Success Response (200)
```json
{
  "success": true,
  "message": "Record fetched successfully",
  "data": {
    "_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "title": "Office Supplies Purchase",
    "type": "expense",
    "category": "supplies",
    "amount": 49.99,
    "description": "Monthly office supplies restock",
    "date": "2026-04-02T10:30:00.000Z",
    "userId": "550e8400e29b41d4a716446655440000",
    "isDeleted": false,
    "createdAt": "2026-04-02T14:20:30.000Z",
    "updatedAt": "2026-04-02T14:20:30.000Z"
  }
}
```

#### Error Responses
- `404`: Record not found
- `403`: Forbidden (viewers can only view their own records)

---

### 4. Update Record
**Endpoint**: `PATCH /api/records/:id`  
**Authorization**: Admin only  
**Description**: Update an existing record

#### Request Body (all fields optional, at least one required)
```json
{
  "title": "Updated Office Supplies Purchase",
  "type": "expense",
  "category": "supplies",
  "amount": 59.99,
  "description": "Quarterly office supplies",
  "date": "2026-04-03T10:30:00Z"
}
```

#### Partial Update Example
```json
{
  "amount": 59.99,
  "description": "Updated description"
}
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Record updated successfully",
  "data": {
    "_id": "660a1b2c3d4e5f6g7h8i9j0k",
    "title": "Updated Office Supplies Purchase",
    "type": "expense",
    "category": "supplies",
    "amount": 59.99,
    "description": "Quarterly office supplies",
    "date": "2026-04-03T10:30:00.000Z",
    "userId": "550e8400e29b41d4a716446655440000",
    "updatedAt": "2026-04-02T15:20:30.000Z"
  }
}
```

#### Error Responses
- `400`: Validation error or no fields provided
- `404`: Record not found
- `403`: Forbidden (only admins can update)

---

### 5. Delete Record
**Endpoint**: `DELETE /api/records/:id`  
**Authorization**: Admin only  
**Description**: Soft delete a record (marks as deleted, doesn't remove from database)

#### Success Response (200)
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "data": {
    "id": "660a1b2c3d4e5f6g7h8i9j0k",
    "title": "Office Supplies Purchase",
    "amount": 49.99,
    "deletedAt": "2026-04-02T15:30:00.000Z",
    "deletedBy": "550e8400e29b41d4a716446655440000"
  }
}
```

#### Error Responses
- `404`: Record not found
- `403`: Forbidden (only admins can delete)

#### Notes
- Records are soft-deleted (marked with `isDeleted: true`, `deletedAt`, `deletedBy`)
- Soft-deleted records are automatically excluded from all queries
- Audit trail is maintained showing who deleted and when

---

### 6. Get Records Summary
**Endpoint**: `GET /api/records/summary`  
**Authorization**: Analyst (any records), Admin (any records)  
**Description**: Get statistical summary of records

#### Query Parameters
- `startDate`: Optional, ISO 8601 date format
- `endDate`: Optional, ISO 8601 date format

#### Examples
```bash
# Get summary for all records
GET /api/records/summary

# Get summary for a specific date range
GET /api/records/summary?startDate=2026-01-01T00:00:00Z&endDate=2026-04-02T23:59:59Z
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Records summary fetched successfully",
  "data": {
    "totalIncome": 5000.00,
    "totalExpense": 1250.50,
    "net": 3749.50,
    "recordCount": 15,
    "byType": {
      "income": 3,
      "expense": 12
    },
    "byCategory": {
      "salary": 5000.00,
      "supplies": 249.99,
      "utilities": 1000.51
    }
  }
}
```

#### Authorization Details
- **Analysts**: See summary for all records
- **Admins**: See summary for all records

---

## Data Models

### Record Schema
```typescript
interface IRecord {
  _id: ObjectId;
  title: string;                    // 1-100 chars
  type: "income" | "expense";
  category: string;                 // 2-50 chars, lowercase
  amount: number;                   // 2 decimal places max
  description: string | null;       // max 500 chars
  date: Date;
  userId: ObjectId;                 // Record owner
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "path": ["amount"],
      "message": "amount must be greater than 0"
    },
    {
      "path": ["category"],
      "message": "category must be at least 2 characters"
    }
  ]
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Record not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Filtering Best Practices

### By Date Range
```bash
GET /api/records?startDate=2026-01-01T00:00:00Z&endDate=2026-02-01T00:00:00Z
```

### By Category
```bash
GET /api/records?category=supplies&limit=50
```

### By Type with Pagination
```bash
GET /api/records?type=expense&page=1&limit=20
```

### Combined Filters
```bash
GET /api/records?type=income&category=salary&startDate=2026-01-01T00:00:00Z&page=1&limit=10
```

---

## Implementation Notes

### Pagination
- Default page: 1
- Default limit: 20
- Maximum limit: 100
- Returns total count and number of pages

### Date Handling
- ISO 8601 format required
- Server stores UTC timestamps
- End date queries include full day (23:59:59.999)

### Role-Based Access
- Enforced at middleware level before controller execution
- Authentication required for all endpoints
- User status must be "active"

**Permission Matrix**:
| Permission | Viewer | Analyst | Admin |
|-----------|--------|---------|-------|
| Create records | ✗ | ✗ | ✓ |
| Read own records | ✓ | ✓ | ✓ |
| Read all records | ✗ | ✓ | ✓ |
| Update records | ✗ | ✗ | ✓ |
| Delete records | ✗ | ✗ | ✓ |
| View own summary | ✗ | ✗ | ✗ |
| View all summary | ✗ | ✓ | ✓ |

### Data Validation
- All inputs validated with Zod schemas
- Errors returned with specific field paths
- Amount values automatically parsed as numbers
- Categories automatically converted to lowercase

### Indexes
- `userId` + `isDeleted` + `date`: Optimizes user-specific queries
- `type` + `isDeleted`: Optimizes type filtering
- `category` + `isDeleted`: Optimizes category filtering
- Single indexes on frequently searched fields

---

## Usage Examples

### Create an Expense
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Coffee Meeting",
    "type": "expense",
    "category": "meals",
    "amount": 15.50,
    "description": "Client meeting at cafe"
  }'
```

### Get Monthly Expenses
```bash
curl http://localhost:3000/api/records?type=expense&startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Summary for Q1
```bash
curl http://localhost:3000/api/records/summary?startDate=2026-01-01T00:00:00Z&endDate=2026-03-31T23:59:59Z \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Record Amount
```bash
curl -X PATCH http://localhost:3000/api/records/660a1b2c3d4e5f6g7h8i9j0k \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 25.50}'
```

### Delete Record
```bash
curl -X DELETE http://localhost:3000/api/records/660a1b2c3d4e5f6g7h8i9j0k \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
