# Component Architecture - LNMIIT Degree Audit System

**Assignment 5: Component Diagram**

---

## System Architecture Overview

The LNMIIT Degree Audit System follows a **layered component architecture** with clear separation of concerns:

1. **Presentation Layer** - User interfaces for different actors
2. **Business Logic Layer** - Use case implementations
3. **Data Access Layer** - Academic data persistence
4. **External Integration Layer** - File upload and external systems

---

## Component Diagram Description

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LNMIIT Degree Audit System                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐                                                  │
│  │ External     │                                                  │
│  │ Users        │                                                  │
│  │ - Student    │                                                  │
│  │ - Faculty    │                                                  │
│  │ - Registrar  │                                                  │
│  └──────┬───────┘                                                  │
│         │                                                          │
│         │ IUserInterface                                           │
│         ▼                                                          │
│  ┌──────────────────────────────────────────────────┐             │
│  │   Presentation Component                         │             │
│  │   - Student views, Advisor views, Registrar UI   │             │
│  │   Provides: IUserInterface                       │             │
│  └──────┬────────────────┬────────────────┬─────────┘             │
│         │                │                │                        │
│         │                │                │                        │
│  ┌──────▼────────┐ ┌─────▼────────┐ ┌────▼──────────┐             │
│  │ User Access   │ │ Degree Audit │ │ At-Risk       │             │
│  │ Component     │ │ Component    │ │ Assessment    │             │
│  │               │ │              │ │ Component     │             │
│  │ - UserAccount │ │ - Student    │ │ - Faculty     │             │
│  │ responsibilities│ │ - Transcript│ │ - Assignment │             │
│  │               │ │ - Course     │ │ - AtRisk      │             │
│  │ Provides:     │ │ - Requirements│ │ Provides:    │             │
│  │ IUserAccount  │ │              │ │ IAtRisk      │             │
│  └───────────────┘ │ Provides:    │ └──────────────┘             │
│                    │ IDegreeAudit │                               │
│                    └──────────────┘                               │
│                                                                    │
│         ┌────────────────────────────────────┐                    │
│         │ Transcript Import Component        │◄──── Transcript    │
│         │ - TranscriptImport                 │      File          │
│         │ - TranscriptValidator              │      (CSV/Excel)   │
│         │ - Transcript record creator        │                    │
│         │ Provides: ITranscriptImport        │                    │
│         └────────────────────────────────────┘                    │
│                          │                                         │
│                          │ IAcademicDataRepository                │
│                          ▼                                         │
│         ┌────────────────────────────────────┐                    │
│         │  Academic Data Component           │                    │
│         │  - Academic record persistence     │                    │
│         │  - Catalog data management         │                    │
│         │  Provides: IAcademicDataRepository │                    │
│         └────────────────────────────────────┘                    │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Descriptions

### 1. Presentation Component
**Responsibility**: User interface and interaction handling

**Included Classes/Modules**:
- Student dashboard and views
- Faculty Advisor dashboard
- Registrar interface
- Authentication UI

**Exposed Interface**: `IUserInterface`
- `displayDashboard(role: String): View`
- `handleUserAction(action: String, params: Object): Response`
- `renderAuditReport(auditData: Object): View`
- `renderAtRiskList(students: List): View`
- `renderImportInterface(): View`

**Dependencies**:
- User Access Component (IUserAccount)
- Degree Audit Component (IDegreeAudit)
- At-Risk Assessment Component (IAtRisk)
- Transcript Import Component (ITranscriptImport)

**Traceability**: All Use Cases (UI layer)

---

### 2. User Access Component
**Responsibility**: Authentication and authorization

**Included Classes/Modules**:
- UserAccount
- Session management
- Role-based access control

**Exposed Interface**: `IUserAccount`
- `authenticate(email: String, password: String): UserSession`
- `checkAccess(userId: String, resource: String): Boolean`
- `getUserRole(userId: String): String`
- `logout(userId: String): void`

**Dependencies**:
- Academic Data Component (for user data)

**Traceability**: UC-001 (Login), All Use Cases (authentication)

---

### 3. Degree Audit Component
**Responsibility**: Calculate and manage degree audits

**Included Classes/Modules**:
- Student
- Transcript
- Course
- Catalog
- Requirement
- AuditReport

**Exposed Interface**: `IDegreeAudit`
- `generateAudit(studentId: String): AuditReport`
- `calculateProgress(studentId: String, catalogYear: String): ProgressData`
- `checkRequirementSatisfaction(requirement: Requirement, transcript: Transcript): Boolean`
- `determineGraduationEligibility(studentId: String): Boolean`
- `getTranscriptHistory(studentId: String): List<Transcript>`

**Dependencies**:
- Academic Data Component (IAcademicDataRepository)

**Traceability**: UC-002 (View Degree Audit)

---

### 4. At-Risk Assessment Component
**Responsibility**: Identify and assess at-risk students

**Included Classes/Modules**:
- FacultyAdvisor
- AdvisorAssignment
- AtRiskAssessment

**Exposed Interface**: `IAtRisk`
- `identifyAtRiskStudents(advisorId: String): List<RiskAssessment>`
- `evaluateRisk(studentId: String): RiskAssessment`
- `getAdvisees(advisorId: String): List<Student>`
- `getRiskFactors(studentId: String): List<String>`
- `sortByRiskSeverity(students: List): List<Student>`

**Dependencies**:
- Degree Audit Component (IDegreeAudit) - to access audit data
- Academic Data Component (IAcademicDataRepository)

**Traceability**: UC-005 (Identify At-Risk Students)

---

### 5. Transcript Import Component
**Responsibility**: Import and validate transcript data

**Included Classes/Modules**:
- TranscriptImport
- TranscriptValidator
- Transcript record creator
- RegistrarStaff

**Exposed Interface**: `ITranscriptImport`
- `validateFile(file: File): ValidationResult`
- `parseTranscriptData(file: File): List<TranscriptRecord>`
- `validateRecords(records: List): ValidationReport`
- `previewImport(records: List): PreviewData`
- `executeImport(importId: String): ImportSummary`
- `triggerAuditRecalculation(studentIds: List): void`

**Dependencies**:
- Academic Data Component (IAcademicDataRepository)
- Degree Audit Component (IDegreeAudit) - to trigger recalculation
- External File System (CSV/Excel files)

**Traceability**: UC-006 (Import Student Transcripts)

---

### 6. Academic Data Component
**Responsibility**: Data persistence and retrieval

**Included Classes/Modules**:
- Database/Storage abstraction
- CRUD operations for all entities
- Query and reporting services

**Exposed Interface**: `IAcademicDataRepository`
- `saveStudent(student: Student): void`
- `getStudent(studentId: String): Student`
- `saveTranscript(transcript: Transcript): void`
- `getTranscriptsByStudent(studentId: String): List<Transcript>`
- `getCatalog(catalogYear: String, program: String): Catalog`
- `getRequirements(catalogId: String): List<Requirement>`
- `getCourse(courseCode: String): Course`
- `saveAuditReport(audit: AuditReport): void`
- `getLatestAudit(studentId: String): AuditReport`

**Implementation**: 
- Prototype: localStorage-based persistence
- Production: Database (MySQL/PostgreSQL) with ORM

**Traceability**: All Use Cases (data layer)

---

## External Dependencies

### 1. Transcript File (CSV/Excel)
**Type**: External file upload
**Format**: CSV or Excel (.xlsx)
**Required Fields**:
- Student ID
- Course Code
- Semester
- Grade
- Credits

**Interface**: File upload via Presentation Component → processed by Transcript Import Component

---

## Component Interaction Flows

### Flow 1: View Degree Audit (UC-002)
```
User → Presentation Component → User Access Component (authenticate)
                              → Degree Audit Component (generateAudit)
                              → Academic Data Component (fetch data)
                              ← Academic Data Component (return data)
                              ← Degree Audit Component (return audit)
     ← Presentation Component (display audit)
```

### Flow 2: Identify At-Risk Students (UC-005)
```
User → Presentation Component → User Access Component (authenticate)
                              → At-Risk Assessment Component (identifyAtRiskStudents)
                              → Degree Audit Component (get audit data)
                              → Academic Data Component (fetch data)
                              ← Academic Data Component (return data)
                              ← Degree Audit Component (return audits)
                              ← At-Risk Assessment Component (return risk list)
     ← Presentation Component (display risk list)
```

### Flow 3: Import Student Transcripts (UC-006)
```
User → Presentation Component → User Access Component (authenticate)
                              → Transcript Import Component (validateFile)
                              → Transcript Import Component (parseData)
                              → Transcript Import Component (validateRecords)
                              → Academic Data Component (verify students/courses)
                              ← Academic Data Component (validation results)
                              ← Transcript Import Component (show preview)
     ← Presentation Component (display preview)
     
User → Presentation Component (confirm import)
                              → Transcript Import Component (executeImport)
                              → Academic Data Component (save transcripts)
                              → Degree Audit Component (recalculate audits)
                              ← Transcript Import Component (import summary)
     ← Presentation Component (display summary)
```

---

## Design Principles Applied

### 1. Separation of Concerns
- Presentation logic separated from business logic
- Business logic separated from data access
- Clear component boundaries

### 2. Interface-Based Design
- Components communicate through well-defined interfaces
- Reduces coupling between components
- Easier testing and maintenance

### 3. Dependency Inversion
- High-level components depend on abstractions (interfaces)
- Low-level components implement interfaces
- Academic Data Component is dependency for all business components

### 4. Single Responsibility
- Each component has a specific, focused responsibility
- User Access handles only authentication/authorization
- Degree Audit handles only audit calculation
- etc.

### 5. Reusability
- Academic Data Component is shared by all business logic components
- Presentation Component can be replaced (web, mobile) without affecting business logic

---

## Technology Stack Mapping

### Presentation Component
- **Technology**: React.js
- **Libraries**: React Router, Axios, Material-UI/Tailwind CSS

### Business Logic Components
- **Technology**: Node.js / Express.js
- **Pattern**: Service Layer / Controller Pattern

### Academic Data Component
- **Prototype**: localStorage API with JSON serialization
- **Production**: MySQL/PostgreSQL with Sequelize ORM

### External File Processing
- **Libraries**: PapaParse (CSV), SheetJS (Excel)

---

*Document prepared by Team T030*  
*Based on Assignment 5*
