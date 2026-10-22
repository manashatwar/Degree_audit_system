# Class Design - LNMIIT Degree Audit System

**Assignment 4: Static Structural Model**

---

## Class Identification Summary

Total of **12 classes** identified based on the three detailed use cases and system requirements.

---

## Class Descriptions

### 1. UserAccount
**Purpose**: Base class for all system users with authentication and access control

**Attributes**:
- `userId`: String - Unique identifier
- `email`: String - User email address
- `role`: String - User role (Student, FacultyAdvisor, RegistrarStaff)
- `accountStatus`: String - Active, Inactive, Suspended
- `lastLogin`: Date - Last login timestamp

**Operations**:
- `authenticate()`: boolean - Verify user credentials
- `checkAccess()`: boolean - Verify access permissions

**Traceability**: UC-002, UC-005, UC-006

---

### 2. Student
**Purpose**: Represents a student enrolled at LNMIIT

**Attributes**:
- `studentId`: String - Unique student identifier
- `name`: String - Student full name
- `program`: String - Academic program (e.g., B.Tech CSE)
- `department`: String - Department code
- `batchYear`: Integer - Year of admission
- `catalogYear`: String - Applicable catalog year
- `currentSemester`: Integer - Current semester number
- `status`: String - Active, Graduated, Withdrawn

**Operations**:
- `viewDegreeAudit()`: void - Initiate audit view
- `viewProgress()`: void - View academic progress

**Relationships**:
- Inherits from UserAccount (1:1)
- Has Transcript (1:0..*)
- Has AuditReport (1:0..*)
- Has AdvisorAssignment (1:0..*)

**Traceability**: UC-002, UC-005

---

### 3. Transcript
**Purpose**: Stores student course completion records

**Attributes**:
- `transcriptId`: String - Unique transcript record identifier
- `studentId`: String - Reference to student
- `semester`: String - Semester (e.g., Fall 2024)
- `grade`: Float - Course grade
- `creditsEarned`: Integer - Credits earned
- `status`: String - Imported, Validated, Archived
- `importDate`: Date - Date of import

**Operations**:
- `validateData()`: boolean - Validate transcript data
- `addCourseRecord()`: void - Add course completion record
- `getCourseHistory()`: List - Retrieve course history

**Relationships**:
- Belongs to Student (1:1)
- References Course (1:1..*)

**Traceability**: UC-002, UC-006

---

### 4. Course
**Purpose**: Represents academic courses in the catalog

**Attributes**:
- `courseCode`: String - Unique course code (e.g., CS301)
- `courseName`: String - Course title
- `department`: String - Offering department
- `credits`: Integer - Credit hours
- `courseType`: String - Core, Elective, Lab, Project
- `prerequisites`: List - Prerequisite course codes

**Operations**:
- `validateCourseCode()`: boolean - Validate course code
- `checkPrerequisite()`: boolean - Check if prerequisites met

**Relationships**:
- Referenced by Transcript (many:1)
- Referenced by Requirement (many:many)

**Traceability**: UC-002, UC-006

---

### 5. Catalog
**Purpose**: Defines degree requirements for a specific catalog year

**Attributes**:
- `catalogId`: String - Unique catalog identifier
- `catalogYear`: String - Academic year (e.g., 2024)
- `program`: String - Program name
- `department`: String - Department code
- `effectiveDate`: Date - Date catalog became effective

**Operations**:
- `getApplicableRequirements()`: List - Get requirement list

**Relationships**:
- Has Requirements (1:1..*, composition)
- Referenced by AuditReport (many:1)

**Traceability**: UC-002

---

### 6. Requirement
**Purpose**: Defines specific degree requirements (Core, Elective, etc.)

**Attributes**:
- `requirementId`: String - Unique requirement identifier
- `category`: String - Core Courses, Electives, Projects, etc.
- `description`: String - Requirement description
- `minimumCredits`: Integer - Minimum credits required
- `minimumGPA`: Float - Minimum GPA required
- `courseList`: List - List of courses that satisfy this requirement
- `rules`: String - Additional rules or constraints

**Operations**:
- `checkSatisfaction()`: boolean - Check if requirement is satisfied
- `identifyDeficiency()`: List - Identify missing courses or credits

**Relationships**:
- Belongs to Catalog (many:1, composition)
- References Course (many:many)
- Referenced by AuditReport (many:many)

**Traceability**: UC-002, UC-005

---

### 7. AuditReport
**Purpose**: Generated degree audit showing student progress

**Attributes**:
- `auditId`: String - Unique audit identifier
- `generatedDate`: Date - Generation timestamp
- `catalogYear`: String - Catalog year used
- `totalCreditsEarned`: Integer - Total credits completed
- `totalCreditsRequired`: Integer - Total credits needed
- `CGPA`: Float - Cumulative GPA
- `graduationEligible`: Boolean - Eligibility status
- `status`: String - Current, Stale, Calculating

**Operations**:
- `calculateProgress()`: void - Calculate overall progress
- `calculateGPA()`: Float - Calculate CGPA
- `determineEligibility()`: boolean - Determine graduation eligibility
- `generateReport()`: void - Generate audit report

**Relationships**:
- Belongs to Student (many:1)
- Uses Catalog (many:1)
- Evaluates Requirements (many:many)
- Used by AtRiskAssessment (1:1)

**Traceability**: UC-002, UC-005

---

### 8. FacultyAdvisor
**Purpose**: Represents faculty members who advise students

**Attributes**:
- `advisorId`: String - Unique advisor identifier
- `name`: String - Advisor full name
- `department`: String - Department affiliation

**Operations**:
- `viewAdvisees()`: List - View assigned students
- `viewStudentAudit()`: void - View student audit
- `identifyAtRiskStudents()`: List - Identify at-risk students

**Relationships**:
- Inherits from UserAccount (1:1)
- Has AdvisorAssignment (1:0..*)
- Performs AtRiskAssessment (1:0..*)

**Traceability**: UC-005

---

### 9. AdvisorAssignment
**Purpose**: Links students to their faculty advisors

**Attributes**:
- `assignmentId`: String - Unique assignment identifier
- `advisorId`: String - Reference to advisor
- `studentId`: String - Reference to student
- `assignmentDate`: Date - Date of assignment
- `status`: String - Active, Completed, Transferred

**Operations**:
- `assignStudent()`: void - Assign student to advisor
- `getAssignedStudents()`: List - Get student list

**Relationships**:
- Links FacultyAdvisor to Student (many:many association)

**Traceability**: UC-005

---

### 10. AtRiskAssessment
**Purpose**: Evaluates student academic risk

**Attributes**:
- `assessmentId`: String - Unique assessment identifier
- `riskIndicators`: List - List of risk factors identified
- `riskLevel`: String - Low, Medium, High
- `deficiencyDetails`: String - Detailed deficiency information

**Operations**:
- `evaluateRisk()`: String - Calculate risk level
- `identifyRiskFactors()`: List - Identify specific risk factors
- `generateAtRiskList()`: List - Generate list of at-risk students

**Relationships**:
- Uses AuditReport (many:1)
- Performed by FacultyAdvisor (many:1)

**Traceability**: UC-005

---

### 11. TranscriptImport
**Purpose**: Manages transcript file import workflow

**Attributes**:
- `importId`: String - Unique import identifier
- `fileName`: String - Uploaded file name
- `fileFormat`: String - CSV, Excel
- `importDate`: Date - Import timestamp
- `recordsImported`: Integer - Number of records imported
- `errorCount`: Integer - Number of errors
- `status`: String - Draft, Validated, Completed, Rejected, Cancelled

**Operations**:
- `validateFile()`: boolean - Validate file format
- `validateRecords()`: List - Validate transcript records
- `previewImport()`: void - Show preview of data
- `confirmImport()`: void - Confirm and execute import
- `generateSummary()`: void - Generate import summary

**Relationships**:
- Performed by RegistrarStaff (many:1)
- Creates Transcript records (1:0..*, composition)
- Depends on Student (for validation)
- Depends on Course (for validation)
- Triggers AuditReport recalculation (dependency)

**Traceability**: UC-006

---

### 12. RegistrarStaff
**Purpose**: Represents registrar office staff members

**Attributes**:
- `registrarId`: String - Unique registrar identifier
- `name`: String - Staff member name
- `department`: String - Office/section

**Operations**:
- `importTranscript()`: void - Initiate import
- `reviewImport()`: void - Review import preview
- `confirmImport()`: void - Confirm import execution

**Relationships**:
- Inherits from UserAccount (1:1)
- Performs TranscriptImport (1:0..*)

**Traceability**: UC-006

---

## Key Relationships Summary

| Relationship | Type | Multiplicity | Justification |
|--------------|------|--------------|---------------|
| UserAccount → Student | Association | 1:1 | Each student has one user account |
| UserAccount → FacultyAdvisor | Association | 1:1 | Each advisor has one user account |
| UserAccount → RegistrarStaff | Association | 1:1 | Each staff has one user account |
| Student → Transcript | Association | 1:0..* | Student has multiple transcript records |
| Student → AuditReport | Association | 1:0..* | Student has multiple audit reports over time |
| Student → AdvisorAssignment | Association | 1:0..* | Student can have multiple advisor assignments |
| FacultyAdvisor → AdvisorAssignment | Association | 1:0..* | Advisor can have multiple assigned students |
| Transcript → Course | Association | 1:1..* | Transcript contains course records |
| Catalog → Requirement | Composition | 1:1..* | Catalog defines requirements |
| Requirement → Course | Association | 1:0..* | Requirements specify courses |
| AuditReport → Catalog | Association | 1:1 | Audit uses specific catalog |
| AuditReport → Requirement | Association | 1:1..* | Audit evaluates requirements |
| AtRiskAssessment → AuditReport | Association | 1:1 | Assessment uses audit data |
| FacultyAdvisor → AtRiskAssessment | Association | 1:0..* | Advisor performs assessments |
| RegistrarStaff → TranscriptImport | Association | 1:0..* | Staff performs imports |
| TranscriptImport → Transcript | Composition | 1:0..* | Import creates transcripts |
| TranscriptImport → Student | Dependency | — | Import validates student IDs |
| TranscriptImport → Course | Dependency | — | Import validates course codes |
| TranscriptImport → AuditReport | Dependency | — | Import triggers recalculation |

---

## Business Rules

### BR-1: Catalog Year Assignment
- Every student must be assigned a catalog year at admission
- Catalog year determines applicable degree requirements
- Catalog year typically does not change unless approved by administration

### BR-2: Grade Requirements
- Only courses with passing grades (≥ 6.0) satisfy degree requirements
- Failed courses remain on transcript but don't count toward credits

### BR-3: At-Risk Criteria
- CGPA < 6.0
- Credit deficiency > 6 credits
- Missing required courses for semester level
- No courses completed in previous semester

### BR-4: Import Validation
- All imported student IDs must exist in system
- All course codes must be valid in course catalog
- Grades must be in range 0-10 or standard letter grades
- Credits must be positive integers
- Duplicate records are flagged for review

### BR-5: Audit Recalculation
- Audit must be recalculated when transcript changes
- Audit becomes "stale" when catalog or transcript updates
- System attempts recalculation; falls back to last successful audit if fails

---

*Document prepared by Team T030*  
*Based on Assignment 4*
