# Implementation Plan - LNMIIT Degree Audit System Prototype

**Team T030**  
**Created**: October 22, 2026

---

## Table of Contents
1. [Overview](#overview)
2. [Implementation Strategy](#implementation-strategy)
3. [Phase Breakdown](#phase-breakdown)
4. [Detailed Task List](#detailed-task-list)
5. [Component Implementation Order](#component-implementation-order)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Testing Strategy](#testing-strategy)
8. [Timeline](#timeline)

---

## Overview

### Objective
Build a fully functional prototype of the LNMIIT Degree Audit System that demonstrates the three core use cases:
- **UC-002**: View Degree Audit (Student)
- **UC-005**: Identify At-Risk Students (Faculty Advisor)
- **UC-006**: Import Student Transcripts (Registrar)

### Technology Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Data Storage**: localStorage (browser-based, no database required)
- **Authentication**: JWT tokens

### Key Features
✅ Role-based authentication (Student, Faculty Advisor, Registrar)  
✅ Real-time degree audit calculation  
✅ At-risk student identification with multiple criteria  
✅ CSV/Excel transcript file upload and validation  
✅ Responsive UI with modern design  
✅ Sample data pre-loaded for testing  

---

## Implementation Strategy

### Approach: Bottom-Up + Incremental

1. **Foundation First**
   - Set up backend structure
   - Create data models
   - Implement localStorage service
   - Add sample seed data

2. **Backend API Development**
   - Authentication endpoints
   - Student endpoints (UC-002)
   - Advisor endpoints (UC-005)
   - Registrar endpoints (UC-006)
   - Test with Postman/Thunder Client

3. **Frontend Development**
   - Setup React project
   - Create shared components (Login, Navigation, Layout)
   - Implement role-based routing
   - Build dashboard pages for each role

4. **Integration & Testing**
   - Connect frontend to backend APIs
   - Test all three use cases end-to-end
   - Fix bugs and refine UI/UX

---

## Phase Breakdown

### Phase 1: Backend Foundation (Tasks 3-4, 10-11)
**Duration**: ~2-3 hours

**Tasks**:
1. ✅ Create backend folder structure
2. Create data models for all 12 classes
3. Implement localStorage service (data persistence layer)
4. Create seed data for testing
5. Implement authentication service
6. Create API routes and controllers

**Deliverables**:
- Backend server running on `http://localhost:5000`
- All API endpoints functional
- Sample data loaded in localStorage
- Authentication working with JWT

---

### Phase 2: Backend API Endpoints (Task 4)
**Duration**: ~2-3 hours

**Tasks**:
1. **Authentication APIs**
   - POST `/api/auth/login` - User login
   - POST `/api/auth/logout` - User logout
   - GET `/api/auth/me` - Get current user

2. **Student APIs (UC-002)**
   - GET `/api/students/:id/audit` - Get degree audit
   - GET `/api/students/:id/transcript` - Get transcript
   - GET `/api/students/:id/progress` - Get progress summary

3. **Advisor APIs (UC-005)**
   - GET `/api/advisors/:id/advisees` - Get assigned students
   - GET `/api/advisors/:id/at-risk` - Get at-risk students list
   - GET `/api/advisors/:id/students/:studentId/audit` - Get advisee audit

4. **Registrar APIs (UC-006)**
   - POST `/api/registrar/import/validate` - Validate file
   - POST `/api/registrar/import/preview` - Preview data
   - POST `/api/registrar/import/confirm` - Execute import

5. **Reference Data APIs**
   - GET `/api/catalogs` - Get all catalogs
   - GET `/api/courses` - Get all courses

**Deliverables**:
- All endpoints tested and working
- Response data matches expected format
- Error handling implemented

---

### Phase 3: Frontend Foundation (Tasks 5, 9, 10)
**Duration**: ~2 hours

**Tasks**:
1. Setup React project with Vite
2. Install dependencies (React Router, Axios, Tailwind CSS)
3. Create folder structure
4. Create shared components:
   - Login page
   - Navigation bar
   - Sidebar menu
   - Layout wrapper
   - Loading spinner
   - Error message display
5. Setup routing (React Router)
6. Create authentication context
7. Implement localStorage service (frontend)

**Deliverables**:
- React app running on `http://localhost:5173`
- Login page functional
- Navigation working
- Protected routes setup

---

### Phase 4: Student Dashboard (Task 6 - UC-002)
**Duration**: ~2-3 hours

**Tasks**:
1. Create Student Dashboard page
2. Implement View Degree Audit component:
   - Display overall progress (credits, CGPA, percentage)
   - Show category-wise requirements (Core, Electives, etc.)
   - Display completed courses with grades
   - Show in-progress courses
   - List remaining requirements
   - Display graduation eligibility status
3. Create Progress Chart (visual representation)
4. Implement Download Audit Report feature
5. Connect to backend API
6. Handle loading and error states

**Components to Build**:
- `StudentDashboard.jsx`
- `DegreeAudit.jsx`
- `ProgressSummary.jsx`
- `CourseList.jsx`
- `RequirementStatus.jsx`
- `GraduationEligibility.jsx`

**Deliverables**:
- Student can log in and view their degree audit
- All progress information displayed correctly
- UI is responsive and intuitive

---

### Phase 5: Faculty Advisor Dashboard (Task 7 - UC-005)
**Duration**: ~2-3 hours

**Tasks**:
1. Create Faculty Advisor Dashboard page
2. Implement At-Risk Students component:
   - Display list of assigned advisees
   - Show at-risk indicator for each student
   - Display risk factors (Low CGPA, Credit deficiency, Missing courses, No recent activity)
   - Sort by risk severity
   - Allow filtering by risk level
3. Implement View Advisee Audit feature:
   - Click on student to view their detailed audit
   - Show same information as student audit view
4. Create summary cards for:
   - Total advisees
   - At-risk students count
   - Students by semester
5. Connect to backend API

**Components to Build**:
- `AdvisorDashboard.jsx`
- `AtRiskStudentList.jsx`
- `StudentRiskCard.jsx`
- `AdviseeAuditModal.jsx`
- `AdvisorSummary.jsx`

**Deliverables**:
- Advisor can log in and view all advisees
- At-risk students identified and highlighted
- Risk factors clearly displayed
- Advisor can view individual student audits

---

### Phase 6: Registrar Dashboard (Task 8 - UC-006)
**Duration**: ~3-4 hours

**Tasks**:
1. Create Registrar Dashboard page
2. Implement Transcript Import component:
   - File upload interface (CSV/Excel)
   - Drag-and-drop support
   - File format validation
   - Parse file and extract records
   - Validate each record:
     - Student ID exists
     - Course code valid
     - Grade in valid range
     - Credits positive
3. Display preview of import data:
   - Show table with all records
   - Highlight valid records (green)
   - Highlight invalid records (red) with error messages
   - Show summary (total, valid, errors)
4. Implement confirm/cancel actions
5. Display import summary after completion
6. Connect to backend API

**Components to Build**:
- `RegistrarDashboard.jsx`
- `TranscriptImport.jsx`
- `FileUpload.jsx`
- `ImportPreview.jsx`
- `ImportSummary.jsx`
- `ValidationErrors.jsx`

**File Processing**:
- Use `PapaParse` for CSV parsing
- Use `xlsx` library for Excel parsing
- Client-side validation before API call

**Deliverables**:
- Registrar can log in and access import interface
- File upload works for CSV and Excel
- Validation catches all error types
- Preview shows clear validation results
- Import executes successfully
- Audit recalculation triggered automatically

---

### Phase 7: Integration & Polish (Task 12)
**Duration**: ~1-2 hours

**Tasks**:
1. End-to-end testing of all three use cases
2. Fix any bugs discovered
3. Improve UI/UX:
   - Add loading states
   - Improve error messages
   - Polish styling
   - Add animations/transitions
4. Test with different user roles
5. Test with edge cases:
   - Empty data
   - Large datasets
   - Invalid inputs
6. Create README with:
   - Setup instructions
   - How to run the prototype
   - Test user credentials
   - Feature list
   - Screenshots

**Deliverables**:
- Fully functional prototype
- All three use cases working flawlessly
- Clean, professional UI
- Comprehensive README

---

## Detailed Task List

### Backend Tasks

#### 1. Data Models (`backend/src/models/`)
- [ ] `User.js` - User account model
- [ ] `Student.js` - Student entity
- [ ] `FacultyAdvisor.js` - Faculty advisor entity
- [ ] `RegistrarStaff.js` - Registrar staff entity
- [ ] `Transcript.js` - Transcript records
- [ ] `Course.js` - Course catalog
- [ ] `Catalog.js` - Degree catalog
- [ ] `Requirement.js` - Degree requirements
- [ ] `AuditReport.js` - Generated audit
- [ ] `AdvisorAssignment.js` - Advisor-student links
- [ ] `AtRiskAssessment.js` - Risk assessment
- [ ] `TranscriptImport.js` - Import workflow

#### 2. Services (`backend/src/services/`)
- [ ] `authService.js` - Authentication logic
- [ ] `studentService.js` - Student business logic
- [ ] `auditService.js` - Audit calculation logic
- [ ] `advisorService.js` - Advisor business logic
- [ ] `riskAssessmentService.js` - At-risk evaluation
- [ ] `registrarService.js` - Registrar business logic
- [ ] `importService.js` - Import processing logic
- [ ] `storageService.js` - localStorage CRUD operations

#### 3. Controllers (`backend/src/controllers/`)
- [ ] `authController.js` - Auth endpoints
- [ ] `studentController.js` - Student endpoints
- [ ] `advisorController.js` - Advisor endpoints
- [ ] `registrarController.js` - Registrar endpoints
- [ ] `catalogController.js` - Catalog endpoints

#### 4. Routes (`backend/src/routes/`)
- [ ] `authRoutes.js`
- [ ] `studentRoutes.js`
- [ ] `advisorRoutes.js`
- [ ] `registrarRoutes.js`
- [ ] `catalogRoutes.js`

#### 5. Utilities (`backend/src/utils/`)
- [ ] `jwtUtils.js` - JWT token generation/verification
- [ ] `validation.js` - Input validation helpers
- [ ] `calculateGPA.js` - GPA calculation
- [ ] `fileParser.js` - CSV/Excel parsing

#### 6. Seed Data (`backend/src/data/`)
- [ ] `seedData.js` - Initialize sample data
- [ ] Sample users (10 students, 2 advisors, 1 registrar)
- [ ] Sample courses (30+ courses)
- [ ] Sample transcripts (student course records)
- [ ] Sample catalogs and requirements

---

### Frontend Tasks

#### 1. Core Setup (`frontend/src/`)
- [ ] Setup Vite + React project
- [ ] Install dependencies
- [ ] Configure Tailwind CSS
- [ ] Setup React Router
- [ ] Create folder structure

#### 2. Context & Services (`frontend/src/`)
- [ ] `contexts/AuthContext.jsx` - Authentication state
- [ ] `services/api.js` - Axios instance with interceptors
- [ ] `services/authService.js` - Auth API calls
- [ ] `services/studentService.js` - Student API calls
- [ ] `services/advisorService.js` - Advisor API calls
- [ ] `services/registrarService.js` - Registrar API calls
- [ ] `utils/localStorage.js` - Browser storage helper

#### 3. Shared Components (`frontend/src/components/`)
- [ ] `Login.jsx` - Login page
- [ ] `Navbar.jsx` - Top navigation
- [ ] `Sidebar.jsx` - Side menu
- [ ] `Layout.jsx` - Page wrapper
- [ ] `ProtectedRoute.jsx` - Route guard
- [ ] `LoadingSpinner.jsx` - Loading indicator
- [ ] `ErrorMessage.jsx` - Error display
- [ ] `Card.jsx` - Card container
- [ ] `Table.jsx` - Data table
- [ ] `Badge.jsx` - Status badge
- [ ] `Button.jsx` - Reusable button

#### 4. Student Pages (`frontend/src/pages/student/`)
- [ ] `StudentDashboard.jsx`
- [ ] `DegreeAudit.jsx`
- [ ] Components for audit display

#### 5. Advisor Pages (`frontend/src/pages/advisor/`)
- [ ] `AdvisorDashboard.jsx`
- [ ] `AtRiskStudents.jsx`
- [ ] `AdviseeAudit.jsx`
- [ ] Components for risk display

#### 6. Registrar Pages (`frontend/src/pages/registrar/`)
- [ ] `RegistrarDashboard.jsx`
- [ ] `TranscriptImport.jsx`
- [ ] Components for import workflow

---

## Component Implementation Order

### Order of Development (Priority)

1. **Backend Foundation** ⭐ START HERE
   - localStorage service
   - Data models
   - Seed data
   - Authentication

2. **Backend APIs**
   - Auth endpoints
   - Student endpoints (UC-002)
   - Advisor endpoints (UC-005)
   - Registrar endpoints (UC-006)

3. **Frontend Foundation**
   - React setup
   - Shared components
   - Authentication flow
   - Routing

4. **Student Dashboard (UC-002)**
   - View degree audit
   - Progress display

5. **Advisor Dashboard (UC-005)**
   - At-risk student list
   - View advisee audit

6. **Registrar Dashboard (UC-006)**
   - File upload
   - Import preview
   - Import execution

7. **Integration & Testing**
   - Connect all pieces
   - End-to-end testing
   - Bug fixes

---

## Data Flow Architecture

### UC-002: View Degree Audit
```
Student logs in
  ↓
Frontend: GET /api/students/:id/audit
  ↓
Backend: studentController.getAudit()
  ↓
Backend: auditService.generateAudit()
  ↓
Backend: storageService reads from localStorage:
  - Student data
  - Transcript records
  - Catalog requirements
  ↓
Backend: Calculate progress, GPA, eligibility
  ↓
Backend: Return audit report JSON
  ↓
Frontend: Display audit in UI
```

### UC-005: Identify At-Risk Students
```
Advisor logs in
  ↓
Frontend: GET /api/advisors/:id/at-risk
  ↓
Backend: advisorController.getAtRiskStudents()
  ↓
Backend: riskAssessmentService.evaluateStudents()
  ↓
Backend: For each assigned student:
  - Get audit report
  - Check CGPA < 6.0
  - Check credit deficiency > 6
  - Check missing required courses
  - Check no courses last semester
  ↓
Backend: Sort by risk severity
  ↓
Backend: Return at-risk list JSON
  ↓
Frontend: Display color-coded list with risk indicators
```

### UC-006: Import Student Transcripts
```
Registrar uploads CSV/Excel file
  ↓
Frontend: Parse file (PapaParse/xlsx)
  ↓
Frontend: POST /api/registrar/import/validate
  ↓
Backend: importService.validateFile()
  - Check file format
  - Parse records
  - Validate student IDs
  - Validate course codes
  - Validate grades and credits
  ↓
Backend: Return validation results
  ↓
Frontend: Display preview with errors highlighted
  ↓
Registrar confirms import
  ↓
Frontend: POST /api/registrar/import/confirm
  ↓
Backend: importService.executeImport()
  - Save transcript records
  - Trigger audit recalculation
  ↓
Backend: Return import summary
  ↓
Frontend: Display success message with summary
```

---

## Testing Strategy

### Unit Testing (Optional for prototype)
- Test individual service functions
- Test utility functions (GPA calculation, validation)

### Integration Testing
- Test API endpoints with Postman/Thunder Client
- Verify localStorage operations
- Test authentication flow

### End-to-End Testing (Manual)
- **UC-002**: Student logs in → views audit → sees correct data
- **UC-005**: Advisor logs in → sees at-risk list → clicks student → sees audit
- **UC-006**: Registrar logs in → uploads file → previews → confirms → sees summary

### Edge Cases to Test
- Empty data scenarios
- Invalid authentication
- Invalid file formats
- Validation errors in import
- Large datasets (100+ records)
- Multiple simultaneous users (using different browsers)

---

## Timeline

### Estimated Total Time: 12-16 hours

| Phase | Tasks | Duration | Status |
|-------|-------|----------|--------|
| **Documentation** | .kiro folder & docs | 1-2 hours | ✅ DONE |
| **Backend Foundation** | Models, services, seed data | 2-3 hours | 🔄 IN PROGRESS |
| **Backend APIs** | All endpoints | 2-3 hours | ⏳ PENDING |
| **Frontend Foundation** | Setup, shared components | 2 hours | ⏳ PENDING |
| **Student Dashboard** | UC-002 implementation | 2-3 hours | ⏳ PENDING |
| **Advisor Dashboard** | UC-005 implementation | 2-3 hours | ⏳ PENDING |
| **Registrar Dashboard** | UC-006 implementation | 3-4 hours | ⏳ PENDING |
| **Integration & Polish** | Testing, README | 1-2 hours | ⏳ PENDING |

---

## When Will Implementation Start?

### ✅ Phase 1 Has Already Started!

**Current Status**: Backend foundation in progress

**Already Completed**:
- ✅ .kiro documentation folder created
- ✅ All documentation files written
- ✅ Backend folder structure created
- ✅ package.json configured
- ✅ Express server setup
- ✅ Middleware (auth, error handling)
- ✅ JWT utilities

**Next Immediate Steps** (Continuing Phase 1):
1. Create all data models (12 classes)
2. Implement localStorage service
3. Create seed data with sample users, courses, transcripts
4. Implement authentication service
5. Create all API routes and controllers

**Then Move To**:
- Phase 2: Complete all backend APIs
- Phase 3: Setup React frontend
- Phases 4-6: Implement dashboards
- Phase 7: Integration and testing

---

## Sample Test Credentials

### Will be available after seed data is created:

**Student Account**:
- Email: `rohan.mehta@lnmiit.ac.in`
- Password: `student123`
- Role: Student
- Student ID: S1001

**Faculty Advisor Account**:
- Email: `advisor1@lnmiit.ac.in`
- Password: `advisor123`
- Role: FacultyAdvisor
- Advisor ID: A001

**Registrar Account**:
- Email: `registrar@lnmiit.ac.in`
- Password: `registrar123`
- Role: RegistrarStaff
- Registrar ID: R001

---

## Success Criteria

The prototype will be considered complete when:

✅ All three use cases work end-to-end  
✅ Authentication and authorization working  
✅ Sample data demonstrates all features  
✅ UI is clean, responsive, and intuitive  
✅ No critical bugs  
✅ README with clear instructions  
✅ Can be run locally with `npm start`  

---

*Implementation Plan prepared by Team T030*  
*Last Updated: October 22, 2026*
