# LNMIIT Degree Audit System - Frontend

React-based frontend application for the LNMIIT Degree Audit System with 7 role-based dashboards.

## Technology Stack

- React 18 with Vite
- Tailwind CSS (styling)
- Lucide React (icons)
- React Router (navigation with protected routes)
- Axios (HTTP client)
- PapaParse (CSV parsing)

## Quick Start

```bash
npm install
npx vite --host
```

Application runs on **http://localhost:5173**

## Build

```bash
npm run build
```

Output in `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Main layout with role-based navigation
│   └── PrivateRoute.jsx     # Protected route wrapper
├── pages/
│   ├── Login.jsx            # Unified login page (all 7 roles)
│   ├── student/
│   │   ├── Dashboard.jsx    # Degree audit, progress, CGPA
│   │   └── Exceptions.jsx   # Submit & track exception requests
│   ├── advisor/
│   │   ├── Dashboard.jsx    # Advisees, at-risk students
│   │   └── StudentAudit.jsx # Detailed student audit view
│   ├── registrar/
│   │   └── Dashboard.jsx    # Import, catalogs, assignments
│   ├── dean/
│   │   └── Dashboard.jsx    # Exception review & approval
│   ├── admission/
│   │   └── Dashboard.jsx    # Transfer credits, dean approvals
│   └── admin/
│       ├── Dashboard.jsx    # Admin overview & metrics
│       ├── Users.jsx        # User management (CRUD, roles)
│       ├── Settings.jsx     # System configuration
│       └── Logs.jsx         # Audit log viewer
├── services/
│   ├── api.js               # Axios instance with auth headers
│   ├── authService.js       # Login, logout, token management
│   ├── studentService.js    # Student API calls
│   ├── advisorService.js    # Advisor API calls
│   ├── registrarService.js  # Registrar API calls
│   ├── deanService.js       # Dean API calls
│   ├── admissionService.js  # Admission Cell API calls
│   └── adminService.js      # System Admin API calls
├── contexts/
│   └── AuthContext.jsx      # Auth state & role management
├── App.jsx                  # Routes & role-based routing
├── main.jsx                 # Entry point
└── index.css                # Tailwind & global styles
```

## Features by Role

### Student
- Degree audit with CGPA, credits, progress bars
- Category-wise requirement tracking (Core, Elective, Lab, Humanities)
- Completed courses table and remaining requirements
- Exception request submission (Course Waiver, Grade Exception, Credit Substitution)
- 2-step pipeline tracker for credit substitution requests

### Faculty Advisor
- Advisee overview with stats
- At-risk student identification with 4-criteria risk scoring
- Risk level badges (High/Medium/Low)
- Detailed student audit view

### Registrar
- CSV transcript upload with validation and preview
- Catalog and requirement viewing
- Advisor-student assignment management
- Student records overview

### Dean of Academics
- Exception request queue with filtering
- Approve/reject with notes
- Policy review for waivers and substitutions

### Admission Cell
- Transfer credit recording with external institution details
- Dean-approved credit substitution processing
- Student lookup and evaluation status management

### System Administrator
- User management table (create, edit, lock/unlock, reset password, delete)
- Role assignment across all 7 user types
- System configuration (academic year, semester, thresholds, maintenance mode)
- Searchable audit log viewer with inspector modal

## Design System

- **Primary Navy**: `#1e2d4a` (headers, buttons)
- **Cards**: Rounded corners, subtle shadows
- **Status Pills**: Color-coded badges for status indicators
- **Responsive**: Desktop and mobile layouts
- **Icons**: Lucide React icon library

## Environment

- **Backend API**: `http://localhost:5000/api` (configured in `services/api.js`)
- **Dev Server**: Vite HMR on port 5173

## Team

Team T030 — LNMIIT
