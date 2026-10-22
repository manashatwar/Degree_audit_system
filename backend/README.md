# LNMIIT Degree Audit System - Backend

Node.js/Express backend API for the LNMIIT Degree Audit System.

## Features

- JWT-based authentication
- Role-based access control (Student, Faculty Advisor, Registrar)
- Degree audit calculation with CGPA and progress tracking
- At-risk student identification
- Transcript import with validation
- In-memory data storage (for prototype)

## Tech Stack

- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- uuid (ID generation)

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Environment setup:
Copy `.env.example` to `.env` (already configured)

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Auth, error handling
│   ├── utils/            # Utilities (JWT, validation)
│   └── data/             # Seed data
├── server.js             # Main entry point
├── package.json
└── .env
```

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference:

**Authentication:**
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout

**Student (UC-002):**
- GET `/api/students/:id/audit` - View degree audit
- GET `/api/students/:id/transcript` - Get transcript
- GET `/api/students/:id/progress` - Get progress

**Advisor (UC-005):**
- GET `/api/advisors/:id/advisees` - Get advisees
- GET `/api/advisors/:id/at-risk` - Get at-risk students
- GET `/api/advisors/:id/students/:studentId/audit` - View advisee audit

**Registrar (UC-006):**
- POST `/api/registrar/import/validate` - Validate import
- POST `/api/registrar/import/preview` - Preview data
- POST `/api/registrar/import/confirm` - Execute import

**Catalogs:**
- GET `/api/catalogs` - All catalogs
- GET `/api/catalogs/:year` - Catalog by year
- GET `/api/catalogs/courses/all` - All courses

## Test Credentials

All users have password: `password123`

**Student:**
- rohan.mehta@lnmiit.ac.in (Student ID: S1001)
- priya.sharma@lnmiit.ac.in (Student ID: S1002)
- amit.kumar@lnmiit.ac.in (Student ID: S1003) - At-risk

**Faculty Advisor:**
- dr.sharma@lnmiit.ac.in (Advisor ID: A001)

**Registrar:**
- registrar@lnmiit.ac.in (Registrar ID: R001)

## Sample Data

The system initializes with:
- 11 users (8 students, 2 advisors, 1 registrar)
- 16 courses across departments
- 2 catalogs (2023, 2024)
- 20+ transcript records
- 6 advisor-student assignments

## Testing with cURL

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rohan.mehta@lnmiit.ac.in","password":"password123"}'
```

### Get Audit (use token from login):
```bash
curl http://localhost:5000/api/students/S1001/audit \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Business Logic

### Audit Calculation
- Calculates CGPA from transcript records
- Only grades >= 6.0 count toward credits
- Tracks progress by requirement category
- Determines graduation eligibility

### At-Risk Assessment
Evaluates students based on:
1. CGPA < 6.0 (risk score +3)
2. Credit deficiency > 6 credits (risk score +2)
3. Missing core courses (risk score +2)
4. No activity in 6 months (risk score +3)

Risk levels:
- High: score >= 5
- Medium: score >= 3
- Low: score < 3

### Import Validation
Validates:
- Student ID exists
- Course code is valid
- Grade range (0-10)
- Credits are positive
- Semester format

## Development

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create service logic in `src/services/`
3. Define routes in `src/routes/`
4. Register routes in `server.js`

### Adding New Models

1. Create model class in `src/models/`
2. Add collection to `storageService.js`
3. Add seed data in `src/data/seedData.js`

## Notes

- Data is stored in-memory (resets on server restart)
- For production: replace storageService with database
- JWT secret should be changed in production
- CORS is enabled for all origins (configure for production)

## Team

Team T030 - LNMIIT
- Hatwar Manas Vinod (24UCC175)
- Dhruv Gupta (24UCC176)
- Aradhya Raina (24UCC177)
- Kota Sai Vignesh (24UCC178)
