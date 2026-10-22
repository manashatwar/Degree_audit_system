# LNMIIT Degree Audit System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API endpoints (except login) require JWT authentication.

**Header:**
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "rohan.mehta@lnmiit.ac.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "U001",
      "email": "rohan.mehta@lnmiit.ac.in",
      "role": "Student",
      "accountStatus": "Active",
      "studentId": "S1001",
      "name": "Rohan Mehta",
      "program": "B.Tech CSE",
      "department": "CSE",
      "batchYear": 2024,
      "catalogYear": "2024",
      "currentSemester": 3,
      "status": "Active"
    }
  }
}
```

### 2. Get Current User
**GET** `/auth/me`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "U001",
    "email": "rohan.mehta@lnmiit.ac.in",
    "role": "Student",
    "studentId": "S1001",
    "name": "Rohan Mehta"
  }
}
```

### 3. Logout
**POST** `/auth/logout`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Student Endpoints (UC-002: View Degree Audit)

### 1. Get Degree Audit
**GET** `/students/:id/audit`

**Headers:** Authorization required

**Example:** `/students/S1001/audit`

**Response:**
```json
{
  "success": true,
  "data": {
    "auditId": "uuid",
    "studentId": "S1001",
    "generatedDate": "2026-10-22T10:00:00Z",
    "catalogYear": "2024",
    "totalCreditsEarned": 48,
    "totalCreditsRequired": 160,
    "CGPA": 8.1,
    "graduationEligible": false,
    "status": "Current",
    "categoryProgress": [
      {
        "requirementId": "REQ-2024-01",
        "category": "Core Courses",
        "description": "Core Computer Science courses",
        "creditsRequired": 60,
        "creditsEarned": 24,
        "percentComplete": 40,
        "status": "In Progress"
      }
    ],
    "completedCourses": [
      {
        "courseCode": "CS101",
        "courseName": "Programming Fundamentals",
        "credits": 4,
        "grade": 8.5,
        "semester": "Fall 2024"
      }
    ],
    "inProgressCourses": [],
    "remainingRequirements": [
      {
        "category": "Core Courses",
        "creditsNeeded": 36,
        "description": "Core Computer Science courses"
      }
    ]
  }
}
```

### 2. Get Transcript
**GET** `/students/:id/transcript`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "transcriptId": "uuid",
      "studentId": "S1001",
      "courseCode": "CS101",
      "courseName": "Programming Fundamentals",
      "department": "CSE",
      "semester": "Fall 2024",
      "grade": 8.5,
      "creditsEarned": 4,
      "status": "Imported",
      "importDate": "2024-09-15T12:00:00Z"
    }
  ]
}
```

### 3. Get Progress Summary
**GET** `/students/:id/progress`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "S1001",
    "name": "Rohan Mehta",
    "program": "B.Tech CSE",
    "currentSemester": 3,
    "catalogYear": "2024",
    "totalCreditsEarned": 48,
    "totalCreditsRequired": 160,
    "progressPercentage": 30,
    "CGPA": 8.1,
    "graduationEligible": false,
    "categoryProgress": [...]
  }
}
```

---

## Advisor Endpoints (UC-005: Identify At-Risk Students)

### 1. Get Advisees
**GET** `/advisors/:id/advisees`

**Headers:** Authorization required, Role: FacultyAdvisor

**Example:** `/advisors/A001/advisees`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "S1001",
      "name": "Rohan Mehta",
      "program": "B.Tech CSE",
      "currentSemester": 3,
      "status": "Active"
    }
  ]
}
```

### 2. Get At-Risk Students
**GET** `/advisors/:id/at-risk`

**Headers:** Authorization required, Role: FacultyAdvisor

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAdvisees": 5,
    "atRiskCount": 2,
    "students": [
      {
        "assessmentId": "uuid",
        "studentId": "S1003",
        "assessmentDate": "2026-10-22T10:00:00Z",
        "riskIndicators": [
          "Low CGPA (below 6.0)",
          "Credit Deficiency (8 credits behind)"
        ],
        "riskLevel": "High",
        "deficiencyDetails": "Total Risk Score: 5. Low CGPA; Credit Deficiency",
        "student": {
          "studentId": "S1003",
          "name": "Amit Kumar",
          "program": "B.Tech CSE"
        },
        "audit": {
          "CGPA": 5.8,
          "totalCreditsEarned": 12,
          "graduationEligible": false
        },
        "isAtRisk": true
      }
    ]
  }
}
```

### 3. Get Advisee Audit
**GET** `/advisors/:id/students/:studentId/audit`

**Headers:** Authorization required, Role: FacultyAdvisor

**Example:** `/advisors/A001/students/S1001/audit`

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {...},
    "audit": {...}
  }
}
```

---

## Registrar Endpoints (UC-006: Import Student Transcripts)

### 1. Validate Import
**POST** `/registrar/import/validate`

**Headers:** Authorization required, Role: RegistrarStaff

**Request Body:**
```json
{
  "fileName": "transcripts_fall2024.csv",
  "fileFormat": "CSV",
  "records": [
    {
      "studentId": "S1001",
      "courseCode": "CS301",
      "semester": "Fall 2025",
      "grade": 8.5,
      "credits": 4
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Validation completed",
  "data": {
    "importId": "uuid",
    "validation": {
      "totalRecords": 1,
      "validCount": 1,
      "invalidCount": 0,
      "validRecords": [...],
      "invalidRecords": [],
      "errors": []
    }
  }
}
```

### 2. Preview Import
**POST** `/registrar/import/preview`

**Headers:** Authorization required, Role: RegistrarStaff

**Request Body:**
```json
{
  "records": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 10,
    "validCount": 8,
    "invalidCount": 2,
    "validRecords": [...],
    "invalidRecords": [
      {
        "rowNumber": 3,
        "record": {...},
        "errors": [
          "Row 3: Student S9999 not found in system"
        ]
      }
    ],
    "errors": [...]
  }
}
```

### 3. Confirm Import
**POST** `/registrar/import/confirm`

**Headers:** Authorization required, Role: RegistrarStaff

**Request Body:**
```json
{
  "importId": "uuid",
  "validRecords": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed successfully",
  "data": {
    "importId": "uuid",
    "status": "Completed",
    "recordsImported": 8,
    "affectedStudents": 3
  }
}
```

### 4. Get Import Status
**GET** `/registrar/import/:id/status`

**Headers:** Authorization required, Role: RegistrarStaff

**Response:**
```json
{
  "success": true,
  "data": {
    "importId": "uuid",
    "fileName": "transcripts_fall2024.csv",
    "fileFormat": "CSV",
    "importDate": "2026-10-22T10:00:00Z",
    "recordsImported": 8,
    "errorCount": 2,
    "status": "Completed",
    "validationErrors": []
  }
}
```

---

## Catalog Endpoints

### 1. Get All Catalogs
**GET** `/catalogs`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "catalogId": "CAT-2024-CSE",
      "catalogYear": "2024",
      "program": "B.Tech CSE",
      "department": "CSE",
      "effectiveDate": "2024-08-01",
      "totalCreditsRequired": 160
    }
  ]
}
```

### 2. Get Catalog by Year
**GET** `/catalogs/:year`

**Headers:** Authorization required

**Example:** `/catalogs/2024`

### 3. Get Requirements
**GET** `/catalogs/:year/requirements`

**Headers:** Authorization required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "requirementId": "REQ-2024-01",
      "catalogId": "CAT-2024-CSE",
      "category": "Core Courses",
      "description": "Core Computer Science courses",
      "minimumCredits": 60,
      "minimumGPA": 6.0,
      "courseList": ["CS101", "CS102", "CS201"],
      "rules": "All core courses must be completed"
    }
  ]
}
```

### 4. Get All Courses
**GET** `/catalogs/courses/all`

**Headers:** Authorization required

### 5. Get Course by Code
**GET** `/catalogs/courses/:code`

**Headers:** Authorization required

**Example:** `/catalogs/courses/CS301`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

---

## Test Credentials

**Student:**
- Email: `rohan.mehta@lnmiit.ac.in`
- Password: `password123`
- Student ID: `S1001`

**Faculty Advisor:**
- Email: `dr.sharma@lnmiit.ac.in`
- Password: `password123`
- Advisor ID: `A001`

**Registrar:**
- Email: `registrar@lnmiit.ac.in`
- Password: `password123`
- Registrar ID: `R001`

---

## At-Risk Criteria

Students are flagged as at-risk based on:
1. CGPA below 6.0
2. Credit deficiency > 6 credits
3. Missing required core courses
4. No academic activity in last 6 months

Risk levels:
- **High**: Risk score >= 5
- **Medium**: Risk score >= 3
- **Low**: Risk score < 3
