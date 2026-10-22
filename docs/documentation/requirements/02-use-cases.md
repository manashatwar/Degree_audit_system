# Use Cases - LNMIIT Degree Audit System

**Assignment 2 & 3: Detailed Use Cases and Scenarios**

---

## Complete Use Case List (19 Use Cases)

### Authentication & Access
- **UC-001**: Login

### Student Features
- **UC-002**: View Degree Audit ⭐ (Detailed)
- **UC-003**: Download Audit Report

### Faculty Advisor Features
- **UC-004**: View Advisee Progress
- **UC-005**: Identify At-Risk Students ⭐ (Detailed)
- **UC-016**: Generate Advisor Reports
- **UC-018**: View Advisee Audit Report

### Registrar Office Features
- **UC-006**: Import Student Transcripts ⭐ (Detailed)
- **UC-007**: Define Catalog Requirements
- **UC-008**: Generate Graduation Eligibility Report
- **UC-015**: Update Catalog Requirements

### Admission Cell Features
- **UC-009**: Record Transfer Credits
- **UC-010**: Approve Course Substitution
- **UC-017**: Map Transfer Courses

### HOD Features
- **UC-011**: View Department Analytics

### Dean Features
- **UC-012**: Approve Exception Request

### System Administrator Features
- **UC-013**: Manage User Accounts
- **UC-014**: View System Logs
- **UC-019**: Configure System Settings

---

## Detailed Use Case 1: UC-002 - View Degree Audit

### Basic Information
- **Use Case ID**: UC-002
- **Use Case Name**: View Degree Audit
- **Actor(s)**: Student
- **Priority**: High
- **Complexity**: Medium

### Description
Allows a student to view their complete degree audit showing academic progress, completed courses, in-progress courses, remaining requirements, and graduation eligibility status.

### Preconditions
- Student is authenticated and logged into the system
- Student has an assigned catalog year
- Student's transcript data is available in the system

### Main Flow
1. Student selects "View my Audit" on the degree audit system dashboard
2. System displays the student's transcript
3. System retrieves the applicable catalog requirements for the student's catalog year
4. System calculates the student's degree requirement completion status
5. System displays:
   - Overall academic progress percentage
   - Category-wise requirement status (Core, Electives, etc.)
   - Completed courses with grades and credits
   - In-progress courses
   - Remaining requirements with specific courses needed
6. System displays graduation eligibility status
7. Student reviews the displayed degree audit information

### Alternative Flows

**AF-1: Transcript Unavailable**
- At step 2, if student's transcript is unavailable
- System displays message: "Your transcript data is not available. Please contact the Registrar."
- Use case ends

**AF-2: Catalog Requirements Unavailable**
- At step 3, if catalog requirements cannot be retrieved
- System displays message: "Catalog requirements for your year are being updated. Please try again later."
- Use case ends

**AF-3: Audit Calculation Fails**
- At step 4, if the audit calculation fails
- System checks if a previously calculated audit exists
- If available: System displays the last successfully calculated audit with timestamp
- If not available: System displays message: "Audit calculation failed. Please contact support."
- Use case ends

### Postconditions
**Success**: Student successfully views their current degree audit and understands their academic progress and remaining requirements

**Failure**: Student receives appropriate error message indicating the specific issue

### Business Rules
- BR-1: Audit is calculated based on the student's assigned catalog year
- BR-2: Transfer credits and course substitutions are included in progress calculation
- BR-3: Only courses with passing grades (≥ 6.0) count toward requirement satisfaction
- BR-4: Graduation eligibility requires all minimum credit requirements to be met

---

## Detailed Use Case 2: UC-005 - Identify At-Risk Students

### Basic Information
- **Use Case ID**: UC-005
- **Use Case Name**: Identify At-Risk Students
- **Actor(s)**: Faculty Advisor
- **Priority**: High
- **Complexity**: Medium

### Description
Allows a faculty advisor to identify students under their advisement who are at academic risk based on defined criteria such as low CGPA, credit deficiency, or missing required courses.

### Preconditions
- Faculty Advisor is authenticated and logged into the system
- Faculty Advisor has assigned advisees
- Audit data for advisees is available in the system

### Main Flow
1. Faculty Advisor selects "At-Risk Students" button on the dashboard
2. System retrieves degree audit information for all of the advisor's assigned students
3. System applies the defined at-risk criteria:
   - CGPA below 6.0
   - Missing required courses for current semester level
   - Credit deficiency of more than 6 credits
   - No courses completed in previous semester
4. System identifies students meeting one or more risk criteria
5. System generates a list containing:
   - Student name and ID
   - Risk indicators (low CGPA, credit deficiency, missing courses, no recent activity)
   - Current CGPA and total credits earned
   - Specific academic deficiencies
6. System sorts the list by risk severity (multiple criteria > single criterion)
7. Faculty Advisor reviews the at-risk student list
8. Faculty Advisor may select an individual student to view their detailed degree audit

### Alternative Flows

**AF-1: No Assigned Advisees**
- At step 2, if the Faculty Advisor has no assigned students
- System displays message: "You have no students currently assigned to you."
- Use case ends

**AF-2: No At-Risk Students**
- At step 4, if no students meet the at-risk criteria
- System displays message: "No at-risk students found among your advisees. All students are on track."
- Use case ends

**AF-3: View Individual Audit**
- At step 8, if advisor selects a specific student
- System displays that student's detailed degree audit (UC-002 workflow)
- Advisor can return to the at-risk list
- Use case continues from step 7

### Postconditions
**Success**: Faculty Advisor successfully identifies students who may be at academic risk and can review their individual academic progress for intervention

**Failure**: Faculty Advisor receives appropriate message if no data is available

### Business Rules
- BR-1: At-risk criteria are defined by academic policy and configurable
- BR-2: Students meeting multiple criteria are ranked higher in severity
- BR-3: Only active students (not graduated or withdrawn) are evaluated
- BR-4: Advisors can only view students assigned to them

---

## Detailed Use Case 3: UC-006 - Import Student Transcripts

### Basic Information
- **Use Case ID**: UC-006
- **Use Case Name**: Import Student Transcripts
- **Actor(s)**: Registrar Staff
- **Priority**: High
- **Complexity**: High

### Description
Allows Registrar staff to import student transcript data from CSV or Excel files, validate the data, preview the import, and update student records in the system.

### Preconditions
- Registrar staff is authenticated and logged into the system
- Registrar has a transcript file in supported format (CSV or Excel)
- File contains required fields: student ID, course code, grade, credits, semester

### Main Flow
1. Registrar selects "Import Student Transcripts" on the dashboard
2. System displays the transcript import interface
3. Registrar selects the transcript file to upload
4. System validates the file format (CSV or Excel)
5. System reads and parses the transcript data
6. System validates each record:
   - Student ID exists in system
   - Course code is valid
   - Grade is in acceptable range
   - Credits are positive numbers
   - Semester format is valid
7. System displays a preview of the data with validation results:
   - Total records found
   - Valid records (green)
   - Records with errors (red) with specific error messages
8. Registrar reviews the preview
9. Registrar confirms the import
10. System imports the valid transcript records into the database
11. System triggers recalculation of affected degree audits
12. System displays import summary:
    - Number of records successfully imported
    - Number of records with errors
    - List of errors (if any)

### Alternative Flows

**AF-1: Invalid File Format**
- At step 4, if file format is not CSV or Excel
- System displays error: "Invalid file format. Please upload a CSV or Excel file."
- System rejects the file
- Use case returns to step 3

**AF-2: Validation Errors Found**
- At step 6, if validation errors are detected
- System displays all records with specific error messages:
  - "Student ID S9999 not found in system"
  - "Invalid course code: XYZ999"
  - "Invalid grade value: 15"
  - "Credits must be positive: -3"
- Registrar must correct issues in the source file
- Use case returns to step 3

**AF-3: Cancel Import**
- At step 9, if Registrar cancels before confirmation
- System discards the uploaded file and validation results
- System returns to import interface
- Use case ends

**AF-4: Partial Success**
- At step 10, if some records cannot be imported due to system errors
- System imports all valid records
- System generates error report for failed records
- System displays partial success message with details
- Use case ends

### Postconditions
**Success**: Student transcript data is successfully imported into the system and affected degree audits are recalculated

**Failure**: System provides detailed error messages allowing Registrar to correct issues

### Business Rules
- BR-1: Duplicate records (same student, course, semester) are rejected or updated based on configuration
- BR-2: Only courses from approved catalog are accepted
- BR-3: Import triggers automatic audit recalculation for affected students
- BR-4: Import history is logged for audit trail
- BR-5: Maximum file size limit is 10MB or 10,000 records

---

## Actors and Their Use Cases

### Student
- UC-001: Login
- UC-002: View Degree Audit
- UC-003: Download Audit Report

### Faculty Advisor
- UC-001: Login
- UC-004: View Advisee Progress
- UC-005: Identify At-Risk Students
- UC-016: Generate Advisor Reports
- UC-018: View Advisee Audit Report

### Registrar Office
- UC-001: Login
- UC-006: Import Student Transcripts
- UC-007: Define Catalog Requirements
- UC-008: Generate Graduation Eligibility Report
- UC-015: Update Catalog Requirements

### Admission Cell
- UC-001: Login
- UC-009: Record Transfer Credits
- UC-010: Approve Course Substitution
- UC-017: Map Transfer Courses

### Head of Department (HOD)
- UC-001: Login
- UC-011: View Department Analytics

### Dean of Academic Affairs
- UC-001: Login
- UC-012: Approve Exception Request

### System Administrator
- UC-001: Login
- UC-013: Manage User Accounts
- UC-014: View System Logs
- UC-019: Configure System Settings

---

*Document prepared by Team T030*  
*Based on Assignments 2 & 3*
