# Interaction Models - LNMIIT Degree Audit System

**Assignment 5: Collaboration Diagrams and State Diagrams**

---

## Collaboration Diagrams

Collaboration diagrams show object interactions and message flows for each use case.

### Collaboration Diagram 1: UC-002 - View Degree Audit

**Participating Objects**:
1. `student:Student` - Student actor
2. `account:UserAccount` - Authentication
3. `transcript:Transcript` - Course history
4. `course:Course` - Course details
5. `catalog:Catalog` - Catalog requirements
6. `requirement:Requirement` - Degree requirements
7. `audit:AuditReport` - Generated audit

**Message Flow**:
```
1: student → UserAccount: checkAccess()
   └─ Checks authentication role access
   
2: student → Transcript: getCourseHistory()
   └─ Supplies completed and attempted courses
   
3: student → AuditReport: calculateProgress()
   └─ Requests progress and eligibility
   
4: AuditReport → Catalog: getApplicableRequirements()
   └─ Selects catalog year rules
   
5: Catalog → Requirement: [requirement rules]
   └─ Provides the catalog defined requirements
   
6: Requirement → Course: validateCourseCode()
   └─ Checks listed course codes
   
7: AuditReport → Student: generateAuditReport()
   └─ Returns progress and remaining requirements
```

**Object Responsibilities**:
- **Student**: Initiates audit view request
- **UserAccount**: Verifies authentication and role
- **Transcript**: Supplies completed and attempted courses
- **Course**: Provides course details and credits
- **Catalog**: Identifies applicable catalog year
- **Requirement**: Defines category requirements and minimum credits
- **AuditReport**: Calculates progress, GPA, and eligibility

---

### Collaboration Diagram 2: UC-005 - Identify At-Risk Students

**Participating Objects**:
1. `advisor:FacultyAdvisor` - Faculty advisor actor
2. `account:UserAccount` - Authentication
3. `assignment:AdvisorAssignment` - Advisor-student links
4. `student:Student` - Advisee information
5. `audit:AuditReport` - Student audit data
6. `assessment:AtRiskAssessment` - Risk evaluation
7. `transcript:Transcript` - Academic history
8. `catalog:Catalog` - Requirement definitions

**Message Flow**:
```
1: advisor → UserAccount: checkAccess()
   └─ Verifies advisor access
   
2: advisor → AdvisorAssignment: getAssignedStudents()
   └─ Retrieves assigned advisees
   
3: AdvisorAssignment → Student: [studentId]
   └─ Returns each assigned student
   
4: Student → AuditReport: evaluateAudit(transcripts)
   └─ Populates applicable degree rules
   
5: AuditReport → AtRiskAssessment: evaluateRisk()
   └─ Applies criteria to audit
   
6: advisor → AtRiskAssessment: identifyAtRiskStudents()
   └─ CGPA < 6, credit deficiency, missing level courses, zero last semester
   
7: AtRiskAssessment → AuditReport: evaluateRisk()
   └─ Returns list ordered by risk, severity
   
8: AtRiskAssessment → FacultyAdvisor: generateAtRiskList()
   └─ Returns the ordered at-risk student list
   
9: advisor → Student: getAssignedStudent() [name or audit]
   └─ Displays at-risk student message
```

**Object Responsibilities**:
- **FacultyAdvisor**: Requests at-risk list
- **UserAccount**: Verifies advisor identity
- **AdvisorAssignment**: Links advisor to students
- **Student**: Provides basic student information
- **AuditReport**: Provides calculated academic progress
- **AtRiskAssessment**: Evaluates risk criteria and generates sorted list
- **Transcript**: Provides course completion history
- **Catalog**: Provides requirement benchmarks

---

### Collaboration Diagram 3: UC-006 - Import Student Transcripts

**Participating Objects**:
1. `registrar:RegistrarStaff` - Registrar actor
2. `account:UserAccount` - Authentication
3. `import:TranscriptImport` - Import workflow manager
4. `student:Student` - Student validation
5. `transcript:Transcript` - Transcript records
6. `course:Course` - Course validation
7. `audit:AuditReport` - Audit recalculation

**Message Flow**:
```
1: registrar → UserAccount: checkAccess()
   └─ Checks registrar permissions
   
2: registrar → TranscriptImport: uploadFile()
   └─ Supplies transcript data file
   
3: TranscriptImport → Student: [studentId]
   └─ Resolves transcript owner
   
4: TranscriptImport → Course: validateCourseCode()
   └─ Checks file grades and credits
   
5: TranscriptImport → RegistrarStaff: previewImport()
   └─ Shows parsed imported records
   
6: registrar → TranscriptImport: confirmImport()
   └─ Permits accepted records
   
7: TranscriptImport → Transcript: validateRecords()
   └─ Verifies each imported course
   
8: TranscriptImport → Transcript: addCourseRecord()
   └─ Persists accepted records
   
9: TranscriptImport → AuditReport: calculateProgress()
   └─ Recalculates affected student audits
   
10: TranscriptImport → RegistrarStaff: generateSummary()
    └─ Returns processed and error counts
```

**Object Responsibilities**:
- **RegistrarStaff**: Initiates and confirms import
- **UserAccount**: Verifies registrar access
- **TranscriptImport**: Manages import workflow and validation
- **Student**: Validates student IDs exist
- **Course**: Validates course codes are correct
- **Transcript**: Stores validated course records
- **AuditReport**: Triggers audit recalculation

---

## State Diagrams

State diagrams model the lifecycle of key entities.

### State Diagram 1: TranscriptImport

**States**:
1. **Draft** (Initial) - File selection started
2. **File Validated** - File format accepted
3. **Records Validated** - Data validation completed
4. **Previewed** - Data preview displayed
5. **Confirmed** - Import confirmed by registrar
6. **Audits Recalculated** - Audits updated
7. **Imported** (Final success) - Import completed
8. **Rejected** (Final failure) - Invalid file format
9. **Cancelled** (Final cancellation) - User cancelled

**Transitions**:
```
Draft → File Validated
  Event: selectFile() / validateFile()
  Guard: [file format valid]

File Validated → Records Validated
  Event: validFormat [true] / validateRecords()

Records Validated → Previewed
  Event: recordsChecked / previewImport()

Previewed → Confirmed
  Event: confirm [valid records]
  Guard: [validation errors == 0]

Confirmed → Audits Recalculated
  Event: confirmImport() / recordsImported
  Guard: [records imported successfully]

Audits Recalculated → Imported
  Event: auditsFinal [true]
  Guard: [all affected audits recalculated]

Draft/File Validated/Records Validated → Rejected
  Event: validateFile() [format invalid] / validateRecords() [errors > threshold]

Draft/File Validated/Records Validated/Previewed → Cancelled
  Event: cancel [before confirmation]
  Guard: [user cancels operation]
```

**Guard Conditions**:
- `[file format valid]`: File is CSV or Excel with proper structure
- `[validation errors == 0]`: No critical validation errors found
- `[records imported successfully]`: Database write operations succeeded
- `[all affected audits recalculated]`: Audit calculation completed

**Description**:
A transcript import starts in Draft state when the registrar selects a file. The system validates the file format; if valid, it moves to File Validated. Records are then parsed and validated (checking student IDs, course codes, grades, credits). After validation, the system displays a preview. The registrar reviews and confirms, triggering import into the database and audit recalculation. Invalid formats lead to Rejected; user cancellation leads to Cancelled.

---

### State Diagram 2: AuditReport

**States**:
1. **Not Calculated** (Initial) - No audit exists
2. **Calculating** - Audit calculation in progress
3. **Current** (Final success) - Up-to-date audit available
4. **Calculation Failed** (Final error) - Calculation error occurred
5. **Cached Audit** (Fallback) - Last successful audit displayed
6. **Stale** - Audit outdated due to data changes

**Transitions**:
```
Not Calculated → Calculating
  Event: viewAudit() / calculateProgress()

Calculating → Current
  Event: calculationComplete [output valid]
  Guard: [transcript and catalog data available]

Calculating → Cached Audit
  Event: calculationFailed [last audit exists]
  Guard: [previous audit available in system]

Calculating → Calculation Failed
  Event: calculationFailed [no cached audit]
  Guard: [no previous audit exists]

Current → Stale
  Event: transcript or catalog updated
  Guard: [underlying data changed]

Stale → Calculating
  Event: recalculate() / calculateProgress()

Cached Audit → Calculating
  Event: retry [user requests] / newCalculation()
```

**Guard Conditions**:
- `[output valid]`: Calculation completed without errors
- `[transcript and catalog data available]`: Required data present
- `[previous audit available in system]`: At least one successful audit exists
- `[no previous audit exists]`: First-time audit calculation
- `[underlying data changed]`: Transcript or catalog modified

**Description**:
When a student requests their audit, the system begins Calculating. If successful, the audit becomes Current and is displayed. If calculation fails but a previous audit exists, the system shows the Cached Audit with a warning. If no previous audit exists, the state becomes Calculation Failed with an error message. When transcript or catalog data changes, a Current audit becomes Stale and must be recalculated.

---

## Sequence vs Collaboration

**Why Collaboration Diagrams?**
- Show object relationships and associations clearly
- Display numbered message sequence
- Compact representation suitable for documentation
- Emphasize object responsibilities and collaboration

**Sequence diagrams** would show time ordering more explicitly but take more space.

---

## Consistency with Class Model

All objects in collaboration diagrams are instances of classes defined in Assignment 4:
- ✅ Student, UserAccount, Transcript, Course, Catalog, Requirement, AuditReport
- ✅ FacultyAdvisor, AdvisorAssignment, AtRiskAssessment
- ✅ RegistrarStaff, TranscriptImport

All operations called in messages are defined operations in the class model.

All state transitions use operations defined in the class model:
- ✅ `validateFile()`, `validateRecords()`, `confirmImport()` - TranscriptImport
- ✅ `calculateProgress()`, `newCalculation()` - AuditReport

---

*Document prepared by Team T030*  
*Based on Assignment 5*
