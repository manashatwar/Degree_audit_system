# LNMIIT Degree Audit System

A comprehensive web-based degree audit system for The LNM Institute of Information Technology, Jaipur. This system automates academic progress tracking, degree requirement verification, and at-risk student identification.

## Team T030

- Hatwar Manas Vinod (24UCC175)
- Dhruv Gupta (24UCC176)
- Aradhya Raina (24UCC177)
- Kota Sai Vignesh (24UCC178)

## Project Overview

This prototype demonstrates three core use cases:

1. **UC-002: View Degree Audit** (Student) - Students can view their complete degree audit with progress tracking, CGPA calculation, and graduation eligibility status.

2. **UC-005: Identify At-Risk Students** (Faculty Advisor) - Faculty advisors can identify and monitor students who are academically at-risk based on multiple criteria.

3. **UC-006: Import Student Transcripts** (Registrar) - Registrar staff can bulk import student transcript data with validation and automatic audit recalculation.

## Features

- Role-based authentication (Student, Faculty Advisor, Registrar)
- Real-time degree audit calculation
- CGPA and credit tracking
- At-risk student identification with 4 criteria
- CSV transcript import with validation
- Professional, clean UI using shadcn/ui
- Responsive design for all screen sizes

## Technology Stack

### Backend
- Node.js with Express.js
- JWT authentication
- In-memory data storage (prototype)
- bcryptjs for password hashing

### Frontend
- React 18 with Vite
- shadcn/ui components
- Tailwind CSS
- React Router
- Axios for API calls
- PapaParse for CSV parsing

## Project Structure

```
Degree_audit_system/
├── .kiro/
│   └── documentation/          # Complete system documentation
│       ├── requirements/       # Use cases and project overview
│       ├── design/            # Class and interaction models
│       ├── architecture/      # Component architecture
│       └── implementation/    # Implementation plan
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data models
│   │   ├── middleware/       # Auth, error handling
│   │   ├── utils/            # Utilities
│   │   └── data/             # Seed data
│   └── server.js             # Main entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/           # Page components
│   │   │   ├── student/     # Student dashboard
│   │   │   ├── advisor/     # Advisor dashboard
│   │   │   └── registrar/   # Registrar dashboard
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Test Credentials

All users have password: **password123**

### Student Account
- **Email**: rohan.mehta@lnmiit.ac.in
- **ID**: S1001
- **Features**: View degree audit, track progress, check graduation eligibility

### Faculty Advisor Account
- **Email**: dr.sharma@lnmiit.ac.in
- **ID**: A001
- **Features**: View advisees, identify at-risk students, view student audits

### Registrar Account
- **Email**: registrar@lnmiit.ac.in
- **ID**: R001
- **Features**: Import transcripts, validate data, manage academic records

## Usage Guide

### For Students

1. Login with student credentials
2. Dashboard displays:
   - Current CGPA and credits earned
   - Progress towards degree completion
   - Graduation eligibility status
   - Category-wise requirement progress
   - Completed courses list
   - Remaining requirements

### For Faculty Advisors

1. Login with advisor credentials
2. Dashboard displays:
   - Total advisees count
   - At-risk students count
   - List of at-risk students with risk indicators
3. Click "View Audit" on any student to see detailed academic progress
4. At-risk criteria:
   - CGPA below 6.0
   - Credit deficiency > 6 credits
   - Missing required core courses
   - No academic activity in last 6 months

### For Registrar

1. Login with registrar credentials
2. Upload CSV file with transcript records
3. System validates:
   - Student IDs exist
   - Course codes are valid
   - Grades are in range (0-10)
   - Credits are positive numbers
4. Preview validation results
5. Confirm import (only valid records)
6. System automatically recalculates affected student audits

### CSV Format for Import

```csv
studentId,courseCode,semester,grade,credits
S1001,CS401,Fall 2025,8.5,4
S1002,CS402,Fall 2025,7.8,4
```

**Required columns:**
- studentId - Student identification number
- courseCode - Course code (e.g., CS301)
- semester - Semester name (e.g., Fall 2025)
- grade - Numeric grade (0-10)
- credits - Credit hours (positive integer)

## Sample Data

The system includes pre-loaded sample data:
- 11 users (8 students, 2 advisors, 1 registrar)
- 16 courses across departments
- 2 catalogs (2023, 2024)
- 20+ transcript records
- Multiple at-risk scenarios

## API Documentation

Complete API documentation available at: `backend/API_DOCUMENTATION.md`

**Key endpoints:**
- `POST /api/auth/login` - User authentication
- `GET /api/students/:id/audit` - Get degree audit
- `GET /api/advisors/:id/at-risk` - Get at-risk students
- `POST /api/registrar/import/preview` - Preview import data
- `POST /api/registrar/import/confirm` - Execute import

## Design Principles

### UI/UX
- Clean, professional design inspired by modern college portals
- LNMIIT campus branding and imagery
- Intuitive navigation with role-based menus
- Responsive layouts for desktop and mobile
- Accessible components following WCAG guidelines

### Architecture
- Component-based frontend with React
- RESTful API with Express
- Service layer for business logic
- In-memory storage (prototype) - easily replaceable with database
- JWT-based authentication and authorization

### Code Quality
- Consistent naming conventions
- Modular component structure
- Reusable shadcn/ui components
- Error handling and validation
- Loading states and user feedback

## Business Rules

### Audit Calculation
- Only courses with grades ≥ 6.0 count toward requirements
- CGPA calculated from all passed courses
- Progress tracked by requirement category
- Graduation requires all minimum credits met and CGPA ≥ 6.0

### At-Risk Assessment
Risk scores calculated based on:
- CGPA < 6.0 (score +3)
- Credit deficiency > 6 credits (score +2)
- Missing core courses (score +2)
- No activity in 6 months (score +3)

Risk levels:
- **High**: score ≥ 5
- **Medium**: score ≥ 3
- **Low**: score < 3

### Import Validation
- Student ID must exist in system
- Course code must be in catalog
- Grade must be between 0 and 10
- Credits must be positive
- Duplicate records are rejected

## Future Enhancements

- Database integration (MySQL/PostgreSQL)
- Email notifications for at-risk students
- PDF audit report generation
- Historical audit comparison
- Advisor appointment scheduling
- Course registration integration
- Mobile native applications
- Advanced analytics and reporting

## Documentation

Complete system documentation available in `.kiro/documentation/`:
- Project overview and vision
- Detailed use case specifications
- Class design and data models
- Component architecture
- Interaction models
- Implementation plan

## License

© 2026 The LNM Institute of Information Technology, Jaipur. All rights reserved.

This project is developed as part of the Software Development Laboratory (CS314) course.

## Support

For questions or issues, contact Team T030 members or refer to the comprehensive documentation in the `.kiro/documentation/` directory.
