# Technology Stack - LNMIIT Degree Audit System Prototype

---

## Overview

This prototype demonstrates the core functionality of the LNMIIT Degree Audit System using modern web technologies with localStorage for data persistence.

---

## Frontend Stack

### Core Framework
- **React.js 18+**
  - Component-based architecture
  - Hooks for state management
  - React Router for navigation
  - Functional components throughout

### UI Libraries
- **Tailwind CSS** or **Material-UI**
  - Responsive design
  - Modern UI components
  - Consistent styling

### State Management
- **React Context API**
  - User authentication state
  - Global application state
  - Data caching

### HTTP Client
- **Axios**
  - API communication
  - Request/response interceptors
  - Error handling

### File Processing
- **PapaParse** - CSV parsing
- **SheetJS (xlsx)** - Excel file processing

### Form Handling
- **React Hook Form** (optional)
  - Form validation
  - Input management

---

## Backend Stack

### Core Framework
- **Node.js 18+**
- **Express.js 4+**
  - RESTful API endpoints
  - Middleware support
  - Route management

### Middleware
- **cors** - Cross-origin resource sharing
- **body-parser** / **express.json()** - Request body parsing
- **morgan** - HTTP request logging (development)

### Authentication
- **JSON Web Tokens (JWT)**
  - Token-based authentication
  - Secure session management

---

## Data Persistence

### Prototype: localStorage
- Browser-based storage
- JSON serialization
- No server-side database required
- Easy testing and demonstration

### Production (Future):
- **MySQL** or **PostgreSQL**
- **Sequelize ORM**
- **Migration scripts**

---

## Development Tools

### Package Management
- **npm** or **yarn**

### Build Tools
- **Vite** (React) - Fast development server
- **Nodemon** (Node.js) - Auto-restart on changes

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Version Control
- **Git**
- **GitHub** / **GitLab**

---

## Project Structure

```
degree-audit-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── contexts/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── .kiro/
│   └── documentation/
│       ├── requirements/
│       ├── design/
│       ├── architecture/
│       └── implementation/
│
└── README.md
```

---

## API Design

### REST API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Students (UC-002)
- `GET /api/students/:id/audit` - Get degree audit
- `GET /api/students/:id/transcript` - Get transcript
- `GET /api/students/:id/progress` - Get progress summary

#### Faculty Advisors (UC-005)
- `GET /api/advisors/:id/advisees` - Get assigned students
- `GET /api/advisors/:id/at-risk` - Get at-risk students
- `GET /api/advisors/:id/students/:studentId/audit` - Get advisee audit

#### Registrar (UC-006)
- `POST /api/registrar/import/validate` - Validate transcript file
- `POST /api/registrar/import/preview` - Preview import data
- `POST /api/registrar/import/confirm` - Confirm and execute import
- `GET /api/registrar/import/:id/status` - Get import status

#### Reference Data
- `GET /api/catalogs` - Get all catalogs
- `GET /api/catalogs/:year` - Get catalog by year
- `GET /api/courses` - Get all courses
- `GET /api/courses/:code` - Get course by code

---

## localStorage Schema

### Key-Value Structure

```javascript
// Users
localStorage.setItem('users', JSON.stringify([...]))

// Students
localStorage.setItem('students', JSON.stringify([...]))

// Transcripts
localStorage.setItem('transcripts', JSON.stringify([...]))

// Courses
localStorage.setItem('courses', JSON.stringify([...]))

// Catalogs
localStorage.setItem('catalogs', JSON.stringify([...]))

// Requirements
localStorage.setItem('requirements', JSON.stringify([...]))

// Audit Reports
localStorage.setItem('auditReports', JSON.stringify([...]))

// Advisor Assignments
localStorage.setItem('advisorAssignments', JSON.stringify([...]))

// Current User Session
localStorage.setItem('currentUser', JSON.stringify({...}))
localStorage.setItem('authToken', 'jwt-token-here')
```

---

## Data Models (JSON)

### User
```json
{
  "userId": "U001",
  "email": "student@lnmiit.ac.in",
  "password": "hashed_password",
  "role": "Student",
  "accountStatus": "Active",
  "lastLogin": "2026-10-22T10:30:00Z"
}
```

### Student
```json
{
  "studentId": "S1001",
  "userId": "U001",
  "name": "Rohan Mehta",
  "program": "B.Tech CSE",
  "department": "CSE",
  "batchYear": 2024,
  "catalogYear": "2024",
  "currentSemester": 3,
  "status": "Active"
}
```

### Transcript
```json
{
  "transcriptId": "T001",
  "studentId": "S1001",
  "courseCode": "CS301",
  "semester": "Fall 2024",
  "grade": 8.5,
  "creditsEarned": 4,
  "status": "Imported",
  "importDate": "2026-09-15T12:00:00Z"
}
```

### Course
```json
{
  "courseCode": "CS301",
  "courseName": "Database Systems",
  "department": "CSE",
  "credits": 4,
  "courseType": "Core",
  "prerequisites": ["CS201"]
}
```

### AuditReport
```json
{
  "auditId": "AUD001",
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
      "category": "Core Courses",
      "creditsRequired": 60,
      "creditsEarned": 24,
      "percentComplete": 40
    }
  ]
}
```

---

## Security Considerations

### Prototype
- Basic JWT authentication
- Password hashing (bcrypt)
- Input validation
- XSS prevention (React default)

### Production Additions
- HTTPS/SSL
- Rate limiting
- SQL injection prevention (parameterized queries)
- CSRF protection
- Session timeout
- Password complexity requirements
- Audit logging

---

## Performance Considerations

### Frontend
- Code splitting (React.lazy)
- Memoization (React.memo, useMemo)
- Virtualized lists for large datasets
- Lazy loading of components

### Backend
- Response caching
- Database query optimization (future)
- Pagination for large result sets
- Async/await for I/O operations

---

## Testing Strategy

### Unit Tests
- React components (Jest, React Testing Library)
- Service functions
- Utility functions

### Integration Tests
- API endpoints (Supertest)
- Component integration
- localStorage operations

### E2E Tests (Future)
- Cypress or Playwright
- Full user workflows

---

## Deployment (Future)

### Frontend
- **Vercel** or **Netlify** - Static hosting
- **AWS S3 + CloudFront** - Enterprise hosting

### Backend
- **Heroku** - Quick deployment
- **AWS EC2** or **DigitalOcean** - VPS hosting
- **Docker** containers

### Database
- **AWS RDS** - Managed MySQL/PostgreSQL
- **MongoDB Atlas** - If using NoSQL

---

*Document prepared by Team T030*
