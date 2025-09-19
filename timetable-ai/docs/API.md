# API Documentation

## Overview

The Timetable AI system provides a RESTful API built with Next.js API routes. All endpoints support CORS and include proper error handling.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

The system uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### File Upload

#### POST /api/upload

Upload Excel files for students, faculty, or rooms data.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: Excel file (.xlsx, .xls, .csv)
  - `type`: `"students"` | `"faculty"` | `"rooms"`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "generated-uuid",
      "Student ID": "S001",
      "Name": "John Doe",
      "Class": "B.Ed",
      "Section": "A",
      "Electives": "English,Math"
    }
  ],
  "message": "5 records processed successfully"
}
```

### Timetable Generation

#### POST /api/generate-timetable

Generate optimized timetable using AI algorithms.

**Request Body:**
```json
{
  "students": [...],
  "faculty": [...],
  "rooms": [...],
  "constraints": {
    "preventFacultyClashes": true,
    "ensureRoomCapacity": true,
    "minBreakTime": 10,
    "balanceWorkload": true,
    "workloadLevel": 1,
    "preferredGirls": 2,
    "minimizeEmptyPeriods": true,
    "maxConsecutiveFaculty": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "timetable": {
    "schedule": {
      "Monday": {
        "9:00 AM": [
          {
            "course": "DATASCI101 - Data Science",
            "faculty": "Prof. Rajesh Iyer",
            "room": "Lab 301",
            "students": 5
          }
        ]
      }
    },
    "summary": {
      "totalSlots": 35,
      "conflictCount": 0,
      "optimizationScore": 100
    },
    "conflicts": []
  },
  "id": "timetable-uuid",
  "message": "Timetable generated successfully using AI optimization"
}
```

### Data Retrieval

#### GET /api/data

Retrieve uploaded data (students, faculty, rooms).

**Query Parameters:**
- `type`: `"students"` | `"faculty"` | `"rooms"` | `"all"`

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [...],
    "faculty": [...],
    "rooms": [...]
  }
}
```

#### GET /api/timetables

Retrieve generated timetables.

**Response:**
```json
{
  "success": true,
  "timetables": [
    {
      "id": "timetable-uuid",
      "timetable": {...},
      "generatedAt": "2025-01-18T10:30:00.000Z",
      "semester": "Fall 2025",
      "program": "B.Ed + FYUP"
    }
  ]
}
```

### Export

#### POST /api/export-pdf

Generate PDF version of timetable.

**Request Body:**
```json
{
  "timetableData": {...},
  "metadata": {
    "semester": "Fall 2025",
    "program": "B.Ed + FYUP",
    "year": 2025
  }
}
```

**Response:**
- Content-Type: `application/pdf`
- File download with proper headers

#### POST /api/export-excel

Generate Excel version of timetable.

**Request Body:**
```json
{
  "timetableData": {...},
  "metadata": {
    "semester": "Fall 2025",
    "program": "B.Ed + FYUP",
    "year": 2025
  }
}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download with proper headers

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error
- `UPLOAD_ERROR`: File upload failed
- `GENERATION_ERROR`: Timetable generation failed

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is configured to allow requests from specified origins. Update `CORS_ORIGINS` environment variable for production.

## Testing

Use tools like Postman or curl to test the API endpoints:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@students.xlsx" \
  -F "type=students"

# Generate timetable
curl -X POST http://localhost:3000/api/generate-timetable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"students":[...],"faculty":[...],"rooms":[...],"constraints":{...}}'
```