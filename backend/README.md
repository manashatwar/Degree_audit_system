# LNMIIT Degree Audit System - Backend

Node.js/Express backend API for the LNMIIT Degree Audit System supporting 7 user roles.

## Features

- JWT-based authentication with 7 user roles
- Role-based access control (Student, FacultyAdvisor, RegistrarStaff, Dean, HOD, AdmissionCell, SystemAdmin)
- Degree audit calculation with CGPA and category-wise progress tracking
- At-risk student identification with 4-criteria risk scoring
- Transcript import with CSV validation
- Exception request workflow (Student → Dean → Admission Cell)
- Transfer credit management
- System administration with user CRUD and immutable audit logs
- In-memory data storage with auto-seeding (prototype)

## Tech Stack

- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- uuid (ID generation)

## Running the Server

```bash
cd backend
npm install
node server.js
```

Server starts on **http://localhost:5000**

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Login, logout, current user
│   │   ├── studentController.js    # Audit, transcript, progress, exceptions
│   │   ├── advisorController.js    # Advisees, at-risk, student audits
│   │   ├── registrarController.js  # Import, catalogs, assignments
│   │   ├── deanController.js       # Exception review, approve/reject
│   │   ├── admissionController.js  # Transfer credits, dean approvals
│   │   └── adminController.js      # Users, config, logs, bulk import
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── advisorRoutes.js
│   │   ├── registrarRoutes.js
│   │   ├── deanRoutes.js
│   │   ├── admissionRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── authService.js          # Authentication & role resolution
│   │   ├── auditService.js         # Degree audit engine
│   │   ├── importService.js        # Transcript import & validation
│   │   └── storageService.js       # In-memory storage & audit logging
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── TransferCredit.js
│   │   ├── SystemLog.js
│   │   └── SystemConfig.js
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify & role authorization
│   │   └── errorHandler.js
│   ├── utils/
│   └── data/
│       └── seedData.js             # 19 users, 39 courses, 73 transcripts
├── server.js
├── package.json
└── API_DOCUMENTATION.md
```

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference.

### Quick Reference

**Authentication:**
- POST `/api/auth/login` — Login
- GET `/api/auth/me` — Get current user
- POST `/api/auth/logout` — Logout

**Student:**
- GET `/api/students/:id/audit` — Degree audit
- GET `/api/students/:id/transcript` — Transcript
- GET `/api/students/:id/progress` — Progress summary
- GET `/api/students/:id/exceptions` — Exception requests
- POST `/api/students/:id/exceptions` — Submit exception request

**Faculty Advisor:**
- GET `/api/advisors/:id/advisees` — Advisee list
- GET `/api/advisors/:id/at-risk` — At-risk students
- GET `/api/advisors/:id/students/:studentId/audit` — Advisee audit

**Registrar:**
- POST `/api/registrar/import/validate` — Validate import
- POST `/api/registrar/import/preview` — Preview data
- POST `/api/registrar/import/confirm` — Execute import
- GET `/api/registrar/students` — All students

**Dean:**
- GET `/api/dean/exceptions` — All exception requests
- PUT `/api/dean/exceptions/:id` — Approve/reject exception

**Admission Cell:**
- GET `/api/admission/transfer-credits` — All transfer credits
- POST `/api/admission/transfer-credits` — Record transfer credit
- GET `/api/admission/students` — All students
- GET `/api/admission/dean-approvals` — Dean-approved credit substitutions

**System Admin:**
- GET `/api/admin/users` — All users
- POST `/api/admin/users` — Create user
- PUT `/api/admin/users/:id` — Update user
- PUT `/api/admin/users/:id/role` — Change role
- PUT `/api/admin/users/:id/status` — Lock/unlock account
- PUT `/api/admin/users/:id/reset-password` — Reset password
- DELETE `/api/admin/users/:id` — Delete user
- GET `/api/admin/config` — System configuration
- PUT `/api/admin/config` — Update configuration
- GET `/api/admin/logs` — Audit logs

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

## Sample Data

Auto-seeded on every startup:
- 19 users (12 students, 3 advisors, 1 registrar, 1 dean, 1 admission, 1 admin)
- 39 courses across CSE, ECE, CCE, Humanities, Management
- 73 transcript records
- 6 catalogs, 24 requirements
- 5 exception requests, 3 transfer credits
- 5 system log entries, 1 system config

## Notes

- Data is stored in-memory — resets on server restart
- For production: replace `storageService` with a database
- JWT secret should be changed in production
- CORS is enabled for all origins — restrict for production

## Team

Team T030 — LNMIIT
- Hatwar Manas Vinod (24UCC175)
- Dhruv Gupta (24UCC176)
- Aradhya Raina (24UCC177)
- Kota Sai Vignesh (24UCC178)
