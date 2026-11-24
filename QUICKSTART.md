# Quick Start Guide — LNMIIT Degree Audit System

Get the full 7-role system running in 5 minutes.

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 2: Start Backend Server (Terminal 1)

```bash
cd backend
node server.js
```

You should see:
```
=== LNMIIT Degree Audit System API ===
Environment: development

Test Credentials:
  Student: 24ucs101@lnmiit.ac.in / password123
  Advisor: dr.sharma@lnmiit.ac.in / password123
  Registrar: registrar@lnmiit.ac.in / password123
  Dean: dean.academics@lnmiit.ac.in / password123
  Admission Cell: admission@lnmiit.ac.in / password123
  System Admin: admin@lnmiit.ac.in / password123
```

Backend is now running on **http://localhost:5000**

## Step 3: Start Frontend (Terminal 2)

```bash
cd frontend
npx vite --host
```

Frontend is now running on **http://localhost:5173**

## Step 4: Open Browser

Navigate to **http://localhost:5173**

## Step 5: Test Each Role

### 1. Student — View Degree Audit & Request Exceptions

- **Login**: `24ucs101@lnmiit.ac.in` / `password123`
- **Dashboard**: CGPA, credits earned/required, progress bars, graduation status
- **Exceptions**: Submit course waivers, grade exceptions, or credit substitutions
- Track credit substitution pipeline: Dean Approval → Admission Cell

### 2. Faculty Advisor — Identify At-Risk Students

- **Login**: `dr.sharma@lnmiit.ac.in` / `password123`
- **Dashboard**: Total advisees, at-risk count, risk percentages
- **At-Risk List**: Students flagged by CGPA, credit deficiency, missing cores, inactivity
- **Student Audit**: Click "View Audit" on any advisee

### 3. Registrar — Import Transcripts

- **Login**: `registrar@lnmiit.ac.in` / `password123`
- **Import**: Upload CSV → Validate → Preview → Confirm Import
- **Catalogs**: View course catalogs and degree requirements
- **Assignments**: Manage student-advisor mappings

### 4. Dean — Approve Exception Requests

- **Login**: `dean.academics@lnmiit.ac.in` / `password123`
- **Exception Queue**: Review pending requests from students
- **Approve/Reject**: With detailed justification notes

### 5. Admission Cell — Process Transfer Credits

- **Login**: `admission@lnmiit.ac.in` / `password123`
- **Dean Approvals**: Process credit substitutions approved by Dean
- **Record Credits**: External institution, course, grade, credit mapping

### 6. System Administrator — Manage System

- **Login**: `admin@lnmiit.ac.in` / `password123`
- **Users**: Create, edit, lock/unlock, change roles, reset passwords
- **Settings**: Academic year, semester, catalog year, at-risk threshold, maintenance mode
- **Audit Logs**: View all system operations with timestamps

## CSV Import Format

```csv
studentId,courseCode,semester,grade,credits
S1001,CS401,Fall 2025,8.5,4
S1002,CS402,Fall 2025,7.8,4
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Ensure backend is running first
- Delete `node_modules` and run `npm install` again

### Login fails
- Ensure backend is running on port 5000
- Check browser console (F12) for errors
- Verify credentials from the table above

### Connection timed out
- Make sure you started Vite with `--host` flag
- Try `npx vite --host` instead of `npm run dev`

## System URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## What's Included (Auto-Seeded Data)

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

---

**Team T030 — LNMIIT**
