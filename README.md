# LNMIIT Degree Audit System

A comprehensive web-based degree audit system for The LNM Institute of Information Technology, Jaipur. This system automates academic progress tracking, degree requirement verification, exception management, transfer credit processing, and administrative operations across **7 user roles**.

## Project Overview

This system implements the complete Software Requirements Specification (SRS) covering:

1. **Student Portal** — View degree audit, track progress, request exceptions (course waivers, grade exceptions, credit substitutions)
2. **Faculty Advisor Dashboard** — Monitor advisees, identify at-risk students, review student audits
3. **HOD Dashboard** — Department-level analytics and oversight
4. **Registrar Office** — Import transcripts, manage catalogs, verify graduation clearance, assign advisors
5. **Dean of Academics** — Review and approve/reject academic exception requests
6. **Admission Cell** — Process dean-approved credit substitutions, record transfer credits
7. **System Administrator** — User management, system configuration, audit logs

## Features

- **7-role authentication** with JWT-based access control
- Real-time degree audit calculation with CGPA and category-wise progress
- At-risk student identification with 4-criteria risk scoring
- CSV transcript import with validation and auto-audit recalculation
- **Exception Request Pipeline**: Student → Dean → (Admission Cell for credit substitutions)
- **Transfer Credit Management** with external institution tracking
- **System Admin Panel**: User CRUD, role management, system configuration, immutable audit logs
- Professional UI with `#1e2d4a` navy theme, Tailwind CSS, card-based layouts
- Responsive design for all screen sizes

## Technology Stack

### Backend
- Node.js with Express.js
- JWT authentication & role-based authorization
- In-memory data storage (prototype — easily replaceable with database)
- bcryptjs for password hashing
- Centralized audit logging

### Frontend
- React 18 with Vite
- Tailwind CSS
- Lucide React icons
- React Router with protected routes
- Axios for API calls
- PapaParse for CSV parsing

## Project Structure

```
Degree_audit_system/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── advisorController.js
│   │   │   ├── registrarController.js
│   │   │   ├── deanController.js
│   │   │   ├── admissionController.js
│   │   │   └── adminController.js
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   │   ├── authService.js
│   │   │   ├── auditService.js
│   │   │   ├── importService.js
│   │   │   └── storageService.js
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Auth & error handling
│   │   ├── utils/             # JWT, validation utilities
│   │   └── data/              # Seed data (19 users, 39 courses, 73 transcripts)
│   └── server.js              # Main entry point
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, PrivateRoute
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Unified login page
│   │   │   ├── student/       # Dashboard, Exceptions
│   │   │   ├── advisor/       # Dashboard, StudentAudit
│   │   │   ├── registrar/     # Dashboard (import, catalogs, assignments)
│   │   │   ├── dean/          # Dashboard (exception approvals)
│   │   │   ├── admission/     # Dashboard (transfer credits, dean approvals)
│   │   │   └── admin/         # Dashboard, Users, Settings, Logs
│   │   ├── services/          # API service modules
│   │   ├── contexts/          # AuthContext
│   │   └── utils/
│   └── public/
├── README.md
├── QUICKSTART.md
├── DEPLOYMENT.md
└── backend/API_DOCUMENTATION.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Backend Server (Terminal 1)

```bash
cd backend
node server.js
```
Backend runs on **http://localhost:5000**

### 3. Start Frontend Server (Terminal 2)

```bash
cd frontend
npx vite --host
```
Frontend runs on **http://localhost:5173**

### 4. Open Browser

Navigate to **http://localhost:5173**

## Test Credentials

All accounts use password: **`password123`**

| Role | Email | Features |
|------|-------|----------|
| **Student** | `24ucs101@lnmiit.ac.in` | View audit, track progress, request exceptions |
| **Faculty Advisor** | `dr.sharma@lnmiit.ac.in` | View advisees, at-risk students, student audits |
| **Registrar** | `registrar@lnmiit.ac.in` | Import transcripts, manage catalogs, assign advisors |
| **Dean** | `dean.academics@lnmiit.ac.in` | Review/approve exception requests |
| **Admission Cell** | `admission@lnmiit.ac.in` | Process transfer credits, dean-approved substitutions |
| **System Admin** | `admin@lnmiit.ac.in` | User management, system settings, audit logs |

## User Role Details

### Student
- **Dashboard**: CGPA, credits earned/required, progress percentage, graduation eligibility
- **Degree Audit**: Category-wise progress (Core, Electives, Lab, Humanities, etc.)
- **Exceptions**: Submit course waivers, grade exceptions, and credit substitutions
- **Pipeline Tracker**: Visual 2-step tracker for credit substitution requests (Dean → Admission Cell)

### Faculty Advisor
- **Advisee Overview**: Total advisees with CGPA and credit stats
- **At-Risk Identification**: 4-criteria risk scoring (CGPA, credit deficiency, missing cores, inactivity)
- **Student Audit View**: Detailed audit for any assigned advisee

### Registrar Office
- **Transcript Import**: CSV upload with validation, preview, and bulk import
- **Catalog Management**: View course catalogs and degree requirements
- **Advisor Assignments**: Manage student-advisor mappings
- **Student Records**: View all student records and audit reports

### Dean of Academics
- **Exception Queue**: Review pending exception requests from students
- **Approve/Reject**: With detailed notes and justification
- **Policy Enforcement**: Course waivers, grade exceptions, credit substitutions

### Admission Cell
- **Transfer Credits**: Record external credits with institution, grade, and course mapping
- **Dean Approvals Queue**: Process dean-approved credit substitutions
- **Evaluation**: Approve immediately or flag for review

### System Administrator
- **User Management**: Create, update, deactivate users across all 7 roles
- **Role Assignment**: Change user roles, lock/unlock accounts, reset passwords
- **System Configuration**: Academic year, semester, catalog year, at-risk threshold, max credits, maintenance mode
- **Audit Logs**: Immutable log of all sensitive operations with search and filter

## Business Rules

### Audit Calculation
- Only courses with grades ≥ 6.0 count toward degree requirements
- CGPA calculated from all attempted courses
- Progress tracked by requirement category
- Graduation requires all minimum credits met and CGPA ≥ 6.0

### Credit Substitution Pipeline
1. Student submits credit substitution request
2. Dean reviews and approves/rejects
3. If approved → appears in Admission Cell queue
4. Admission Cell records transfer credit with external institution details
5. Degree audit automatically recalculates with new credits

### At-Risk Assessment
Risk scores calculated based on:
- CGPA < threshold (score +3)
- Credit deficiency > 6 credits (score +2)
- Missing core courses (score +2)
- No activity in 6 months (score +3)

Risk levels: **High** (≥5), **Medium** (≥3), **Low** (<3)

### Import Validation
- Student ID must exist in system
- Course code must be in catalog
- Grade must be between 0 and 10
- Credits must be positive
- Duplicate records are rejected

## Sample Data

The system initializes with pre-loaded data on every startup:

| Entity | Count |
|--------|-------|
| Users | 19 |
| Students | 12 |
| Faculty Advisors | 3 |
| Courses | 39 |
| Transcripts | 73 |
| Catalogs | 6 |
| Requirements | 24 |
| Exception Requests | 5 |
| Transfer Credits | 3 |
| System Logs | 5 |

## API Documentation

Complete API documentation: [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md)

**Key endpoint groups:**
- `POST /api/auth/login` — Authentication
- `GET /api/students/:id/audit` — Degree audit
- `GET /api/advisors/:id/at-risk` — At-risk students
- `POST /api/registrar/import/confirm` — Transcript import
- `GET /api/dean/exceptions` — Exception requests
- `POST /api/admission/transfer-credits` — Record transfer credits
- `GET /api/admin/users` — User management

## Architecture

```
┌─────────────────────────────────────────────┐
│          Frontend (React + Vite)             │
│          http://localhost:5173               │
│                                             │
│  7 Role Dashboards:                         │
│  Student | Advisor | Registrar | Dean       │
│  Admission Cell | System Admin | HOD        │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST API (Axios)
┌──────────────────▼──────────────────────────┐
│          Backend (Node.js + Express)         │
│          http://localhost:5000/api           │
│                                             │
│  Auth (JWT) | Audit Engine | Import Engine  │
│  Exception Workflow | Transfer Credits      │
│  Admin CRUD | Audit Logging                 │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        In-Memory Storage                     │
│        (Seed Data on Startup)               │
│                                             │
│  19 Users | 12 Students | 39 Courses        │
│  73 Transcripts | 6 Catalogs | 24 Reqs      │
│  5 Exceptions | 3 Transfer Credits          │
│  5 System Logs | 1 System Config            │
└─────────────────────────────────────────────┘
```

## Notes

- **In-memory storage**: All data resets on server restart. Seed data repopulates automatically.
- **Prototype**: For production, replace `storageService` with a database (MySQL/PostgreSQL/MongoDB).
- **JWT Secret**: Change in production via environment variable.
- **CORS**: Currently allows all origins — restrict for production.

## Course Information

- **Course**: CS314 — Software Development Laboratory
- **Institution**: The LNM Institute of Information Technology, Jaipur

## Team

**Team T030**
- Hatwar Manas Vinod (24UCC175)
- Dhruv Gupta (24UCC176)
- Aradhya Raina (24UCC177)
- Kota Sai Vignesh (24UCC178)

## License

© 2026 The LNM Institute of Information Technology, Jaipur. All rights reserved.
