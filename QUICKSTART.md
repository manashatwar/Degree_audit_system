# Quick Start Guide - LNMIIT Degree Audit System

Get the system running in 5 minutes.

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
=== LNMIIT Degree Audit System API ===
Server running on port 5000
Environment: development

Seeding database with sample data...
Database seeded successfully!

Test Credentials:
  Student: rohan.mehta@lnmiit.ac.in / password123
  Advisor: dr.sharma@lnmiit.ac.in / password123
  Registrar: registrar@lnmiit.ac.in / password123
```

Backend is now running on **http://localhost:5000**

## Step 3: Start Frontend Application

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Frontend is now running on **http://localhost:5173**

## Step 4: Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Step 5: Test the System

### Test as Student (UC-002: View Degree Audit)

1. Login with:
   - Email: `rohan.mehta@lnmiit.ac.in`
   - Password: `password123`

2. You'll see:
   - CGPA: 8.1
   - Credits Earned: 48 / 160
   - Progress: 30%
   - Graduation Status: In Progress

3. Scroll to view:
   - Requirement progress bars
   - Completed courses table
   - Remaining requirements

### Test as Faculty Advisor (UC-005: Identify At-Risk Students)

1. Logout and login with:
   - Email: `dr.sharma@lnmiit.ac.in`
   - Password: `password123`

2. You'll see:
   - Total Advisees: 5
   - At-Risk Students: 2
   - Risk percentage

3. View the at-risk student list showing:
   - Student name and ID
   - Risk level (High/Medium/Low)
   - CGPA and credits
   - Risk factors

4. Click "View Audit" on any student to see detailed progress

### Test as Registrar (UC-006: Import Student Transcripts)

1. Logout and login with:
   - Email: `registrar@lnmiit.ac.in`
   - Password: `password123`

2. Create a test CSV file (`test_import.csv`):
```csv
studentId,courseCode,semester,grade,credits
S1001,CS303,Fall 2025,8.5,4
S1002,CS303,Fall 2025,7.8,4
```

3. Upload the file
4. Click "Validate & Preview"
5. Review validation results
6. Click "Import X Records"
7. See import summary

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Ensure backend is running first
- Delete `node_modules` and run `npm install` again

### Login fails
- Ensure backend is running
- Check browser console for errors
- Verify you're using correct test credentials

### Cannot import CSV
- Ensure CSV has correct column names
- Check that student IDs exist (S1001-S1008)
- Check that course codes exist (CS101, CS102, etc.)

## What's Included

### Sample Data
- 8 students (S1001 - S1008)
- 2 faculty advisors (A001, A002)
- 1 registrar (R001)
- 16 courses
- 20+ transcript records
- 2 catalogs (2023, 2024)

### At-Risk Students (Pre-loaded)
- S1003 (Amit Kumar) - Low CGPA, credit deficiency
- S1005 (Vikram Patel) - Significant credit deficiency

## Next Steps

1. **Explore the Documentation**
   - See `.kiro/documentation/` for complete system specs
   - Check `backend/API_DOCUMENTATION.md` for API details

2. **Customize Sample Data**
   - Edit `backend/src/data/seedData.js`
   - Restart backend to reload

3. **Test All Features**
   - Try different user roles
   - Test validation errors in import
   - View different student audits

4. **Review Code**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│         http://localhost:5173           │
│                                         │
│  - Login Page                          │
│  - Student Dashboard                   │
│  - Advisor Dashboard                   │
│  - Registrar Dashboard                 │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
                 │ (Axios)
┌────────────────▼────────────────────────┐
│         Backend (Node.js)               │
│         http://localhost:5000/api       │
│                                         │
│  - Authentication (JWT)                │
│  - Audit Calculation                   │
│  - At-Risk Assessment                  │
│  - Import Validation                   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      In-Memory Storage                  │
│      (Seed Data on Startup)            │
│                                         │
│  - Users, Students, Advisors           │
│  - Courses, Catalogs, Requirements     │
│  - Transcripts, Audits                 │
└─────────────────────────────────────────┘
```

## System URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## Key Commands

### Backend
```bash
npm run dev      # Development mode with auto-restart
npm start        # Production mode
```

### Frontend
```bash
npm run dev      # Development mode with HMR
npm run build    # Production build
npm run preview  # Preview production build
```

## Need Help?

- Check the main README.md
- See documentation in `.kiro/documentation/`
- Review backend API docs: `backend/API_DOCUMENTATION.md`
- Check browser console for frontend errors
- Check terminal for backend errors

---

**Team T030 - LNMIIT**
