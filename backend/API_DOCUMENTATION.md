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

## 1. Authentication Endpoints

### Login
**POST** `/auth/login`

```json
{
  "email": "24ucs101@lnmiit.ac.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "userId": "U001",
      "email": "24ucs101@lnmiit.ac.in",
      "role": "Student",
      "accountStatus": "Active",
      "studentId": "S1001",
      "name": "Rohan Mehta",
      "program": "B.Tech CSE",
      "department": "CSE"
    }
  }
}
```

### Get Current User
**GET** `/auth/me` — Returns authenticated user info

### Logout
**POST** `/auth/logout`

---

## 2. Student Endpoints

### Get Degree Audit
**GET** `/students/:id/audit`

Returns complete degree audit with CGPA, category-wise progress, completed courses, and remaining requirements.

### Get Transcript
**GET** `/students/:id/transcript`

### Get Progress Summary
**GET** `/students/:id/progress`

### Get Exception Requests
**GET** `/students/:id/exceptions`

Returns all exception requests with transfer credit linkage for credit substitutions.

### Submit Exception Request
**POST** `/students/:id/exceptions`

```json
{
  "type": "CreditSubstitution",
  "courseCode": "CS402",
  "reason": "Completed equivalent course at TU Munich",
  "supportingDocs": "Exchange transcript"
}
```

Types: `CourseWaiver`, `GradeException`, `CreditSubstitution`

---

## 3. Faculty Advisor Endpoints

**Authorization:** Role `FacultyAdvisor`

### Get Advisees
**GET** `/advisors/:id/advisees`

### Get At-Risk Students
**GET** `/advisors/:id/at-risk`

Returns students flagged by 4 criteria: low CGPA, credit deficiency, missing cores, inactivity. Includes risk level (High/Medium/Low) and risk score.

### Get Advisee Audit
**GET** `/advisors/:id/students/:studentId/audit`

---

## 4. Registrar Endpoints

**Authorization:** Role `RegistrarStaff`

### Validate Import
**POST** `/registrar/import/validate`

### Preview Import
**POST** `/registrar/import/preview`

```json
{
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

### Confirm Import
**POST** `/registrar/import/confirm`

```json
{
  "importId": "uuid",
  "validRecords": [...]
}
```

### Get All Students
**GET** `/registrar/students`

### Get Import Status
**GET** `/registrar/import/:id/status`

---

## 5. Dean Endpoints

**Authorization:** Role `Dean`

### Get All Exception Requests
**GET** `/dean/exceptions`

Returns all exception requests across students.

### Approve/Reject Exception
**PUT** `/dean/exceptions/:id`

```json
{
  "status": "Approved",
  "deanNotes": "Approved — equivalent course verified"
}
```

Status values: `Approved`, `Rejected`

---

## 6. Admission Cell Endpoints

**Authorization:** Role `AdmissionCell`

### Get All Transfer Credits
**GET** `/admission/transfer-credits`

### Record Transfer Credit
**POST** `/admission/transfer-credits`

```json
{
  "studentId": "S1001",
  "externalInstitution": "TU Munich",
  "externalCourseTitle": "Cloud Computing Architecture",
  "externalGrade": "A",
  "creditsGranted": 4,
  "mappedCourseCode": "CS402",
  "requirementCategory": "Open Electives",
  "evaluationStatus": "Approved",
  "verificationRemarks": "Verified against official transcript",
  "exceptionRequestId": "EXP-2026-004"
}
```

### Get All Students
**GET** `/admission/students`

### Get Dean-Approved Credit Substitutions
**GET** `/admission/dean-approvals`

Returns dean-approved credit substitution requests that haven't been processed yet by Admission Cell.

---

## 7. System Admin Endpoints

**Authorization:** Role `SystemAdmin` or `Admin`

### Get All Users
**GET** `/admin/users`

### Create User
**POST** `/admin/users`

```json
{
  "name": "New User",
  "email": "user@lnmiit.ac.in",
  "role": "Student",
  "department": "CSE",
  "password": "password123"
}
```

### Update User
**PUT** `/admin/users/:id`

### Change User Role
**PUT** `/admin/users/:id/role`

```json
{ "role": "FacultyAdvisor" }
```

### Lock/Unlock Account
**PUT** `/admin/users/:id/status`

```json
{ "accountStatus": "Suspended" }
```

Values: `Active`, `Suspended`, `Inactive`

### Reset Password
**PUT** `/admin/users/:id/reset-password`

```json
{ "newPassword": "newPassword123" }
```

### Delete User
**DELETE** `/admin/users/:id`

### Get System Configuration
**GET** `/admin/config`

### Update System Configuration
**PUT** `/admin/config`

```json
{
  "academicYear": "2026-27",
  "currentSemester": "Even Semester (2026-27)",
  "defaultCatalogYear": "2024",
  "atRiskCgpaThreshold": 5.5,
  "maxCreditsPerSemester": 25,
  "maintenanceMode": false
}
```

### Get Audit Logs
**GET** `/admin/logs`

Returns immutable system logs with userId, action, timestamp, and details.

---

## 8. Catalog Endpoints

### Get All Catalogs
**GET** `/catalogs`

### Get Catalog by Year
**GET** `/catalogs/:year`

### Get Requirements
**GET** `/catalogs/:year/requirements`

### Get All Courses
**GET** `/catalogs/courses/all`

### Get Course by Code
**GET** `/catalogs/courses/:code`

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation error |
| 401 | Unauthorized — invalid or expired token |
| 403 | Forbidden — insufficient role permissions |
| 404 | Not Found — resource doesn't exist |
| 500 | Internal Server Error |

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Test Credentials

All accounts use password: `password123`

| Role | Email |
|------|-------|
| Student | 24ucs101@lnmiit.ac.in |
| Faculty Advisor | dr.sharma@lnmiit.ac.in |
| Registrar | registrar@lnmiit.ac.in |
| Dean | dean.academics@lnmiit.ac.in |
| Admission Cell | admission@lnmiit.ac.in |
| System Admin | admin@lnmiit.ac.in |

---

## Testing with cURL

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"24ucs101@lnmiit.ac.in","password":"password123"}'
```

### Get Audit (use token from login):
```bash
curl http://localhost:5000/api/students/S1001/audit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Exception Requests (Dean):
```bash
curl http://localhost:5000/api/dean/exceptions \
  -H "Authorization: Bearer DEAN_TOKEN_HERE"
```

### Create User (Admin):
```bash
curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{"name":"Test User","email":"test@lnmiit.ac.in","role":"Student","department":"CSE","password":"password123"}'
```
